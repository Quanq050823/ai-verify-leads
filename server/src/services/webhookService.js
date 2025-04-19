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

export const retrieveLead = async (req, res) => {
    const body = req.body;

    console.log(body);
    res.status(200).send("EVENT_RECEIVED");

    // if (body.object === "page") {
    //     body.entry.forEach((entry) => {
    //         entry.changes.forEach((change) => {
    //             if (change.field === "leadgen") {
    //                 const lead = change.value;
    //                 console.log("Received lead:", lead);
    //                 // You can add additional processing here, such as saving the lead to your database
    //             }
    //         });
    //     });
    //     res.status(200).send("EVENT_RECEIVED");
    // } else {
    //     res.sendStatus(404);
    // }
};
