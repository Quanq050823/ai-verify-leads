"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import Producer from "../config/rabbitMQ.js";
import * as flowService from "./flowService.js";
import * as facebookService from "./facebookService.js";

import { publishLead } from "./leadService.js";
import getObjectId from "../utils/objectId.js";
import Lead from "./../models/lead.js";
import convertLeadData from "../utils/convertLeadData.js";

export const appScript = async (userId, leads, flowId, currentNode) => {
    try {
        let importedLeads = [];

        if (!(await flowService.checkFlowExists(flowId, userId))) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Flow does not exist.");
        }

        if (leads?.data?.length > 0) {
            for (const lead of leads.data) {
                const newLead = new Lead({
                    userId: getObjectId(userId),
                    flowId: getObjectId(flowId),
                    leadData: lead,
                    nodeId: currentNode || null,
                });

                await newLead.save();
                importedLeads.push(newLead);
            }
        }

        if (importedLeads.length > 0) {
            await publishLead(userId, flowId, currentNode, importedLeads);
        }

        return importedLeads.length > 0 ? "Lead imported successfully." : null;
    } catch (error) {
        throw error;
    }
};

// ----------------------------- Retrieve Facebook Lead -----------------------------

export const retrieveFaceBookLead = async (data) => {
    try {
        if (data.object !== "page") {
            return res.status(400).json({ message: "Unsupported event type" });
        }

        let result = await Promise.all((data.entry || []).map(handleEntry));

        return result;
    } catch (err) {
        throw err;
    }
};

const handleEntry = async (entry) => {
    const changes = entry.changes || [];

    for (const change of changes) {
        if (change.field === "leadgen") {
            const lead = change.value;
            console.log("✅ Received lead event:", lead);
            await processLeadEvent(lead);
        }
    }
};

const processLeadEvent = async (lead) => {
    const { leadgen_id: leadgenId } = lead;

    if (!leadgenId) {
        console.warn("⚠️ Missing leadgen_id");
        return;
    }

    try {
        let flows = await flowService.getFacebookLeadFlow(lead.page_id, lead.form_id);
        if (!flows || flows.length === 0) {
            console.warn("No flow found for the lead.");
            return;
        }

        for (const flow of flows) {
            let page = await facebookService.getPageByUserAndPageId(flow.userId, lead.page_id);

            const currentNode = flow.nodeData.nodes.find((node) => node.type === "facebookLeadAds");

            const leadData = await fetchLeadData(leadgenId, page.access_token);
            const convertedData = convertLeadData(leadData?.field_data);

            let importedLeads = new Lead({
                userId: getObjectId(flow.userId),
                flowId: getObjectId(flow._id),
                leadData: convertedData,
                nodeId: currentNode.id,
            });

            await importedLeads.save();
            await publishLead(flow.userId, flow._id, currentNode.id, [importedLeads]);
        }
    } catch (err) {
        throw err;
    }
};

const fetchLeadData = async (leadgenId, pageAccessToken) => {
    const url = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${pageAccessToken}`;
    // console.log("Fetching lead data from URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
    }

    return await response.json();
};

// --------------------------------------------------------------------

export const getTranscript = async (data) => {
    try {
        const { leadId, transcript } = data;
        if (!leadId || !transcript) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required parameters.");
        }
        let lead;
        if (transcript && transcript?.length > 0) {
            lead = await Lead.findOneAndUpdate(
                { _id: getObjectId(leadId) },
                { $set: { "leadData.transcript": transcript } },
                { new: true }
            );
        }

        if (!lead) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Lead not found.");
        }

        await publishLead(lead.userId, lead.flowId, lead.nodeId, [lead]);

        return lead;
    } catch (error) {
        console.error("❌ Unexpected error in getTranscribe:", error);
        throw error;
    }
};
