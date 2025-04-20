"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import Producer from "../config/rabbitMQ.js";
import * as flowService from "./flowService.js";
import { publishLead } from "./leadService.js";
import getObjectId from "../utils/objectId.js";
import Lead from "./../models/lead.js";

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

const PAGE_ACCESS_TOKEN =
    "EAAQvKWZCZAU9ABO9MAsrJ1NPtrZAGosfxXrTb89yih9nqZBOhjky0Cka5XTsj2njyZB6pjG2r8UMMbyA6ZBqa7M6O7oIPgUkdkMusqhgLwEqHMTaicaqXozFuCW7AM3pUzvgNnGAmZARnPQfALv1XwXZBliZBCmWgTSmzNbFV9ANX2QUM3D1tcpzbqbLViUa1zc2SmDpO9nFPy5ht";

export const retrieveLead = async (data) => {
    try {
        if (data.object !== "page") {
            return res.status(400).json({ message: "Unsupported event type" });
        }

        let result = await Promise.all((body.entry || []).map(handleEntry));

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
        const leadData = await fetchLeadData(leadgenId);
        const convertedData = convertLeadData(leadData?.field_data);

        console.log("✅ Converted lead data:", convertedData);
    } catch (err) {
        throw err;
    }
};

const fetchLeadData = async (leadgenId) => {
    const url = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Facebook API error: ${response.statusText}`);
    }

    return await response.json();
};
