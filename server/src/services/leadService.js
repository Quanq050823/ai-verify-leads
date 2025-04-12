"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import getObjectId from "../utils/getObjectId.js";
import Producer from "../config/rabbitMQ.js";
import Flow from "../models/flow.js";
import * as flowService from "./flowService.js";

export const publishLead = async (userId, flowId, nodeId, leads) => {
    try {
        let flow = await flowService.checkFlowExists(flowId, userId);
        if (!flow) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Flow does not exist.");
        }

        const routing = flow.routeData.find((route) => route.source === nodeId);
        if (!routing) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Node does not exist in the flow.");
        }

        const targetNode = routing.target.split("_")[0];

        leads.forEach(async (lead) => {
            await Producer.publishMessage(
                targetNode,
                `${userId}.${flowId}.${targetNode}`,
                lead._id
            );
        });

        return flow ? flow : null;
    } catch (error) {
        throw error;
    }
};
