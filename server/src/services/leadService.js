"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import getObjectId from "../utils/getObjectId.js";
import Producer from "../config/rabbitMQ.js";
import Flow from "../models/flow.js";
import * as flowService from "./flowService.js";

export const publishLead = async (userId, flowId, nodeId, leads, isError = false) => {
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
        const task = isError ? "tasks.deadLead" : `tasks.${targetNode}`;
        let targetExchange = isError ? "deadLead" : targetNode;
        let routingKey = isError ? "deadLead.consumer" : `${userId}.${flowId}.${routing?.target}`;
        leads.forEach(async (lead) => {
            await Producer.publishToCelery(
                targetExchange,
                routingKey,
                {
                    leadId: lead._id,
                    flowId: flowId,
                    userId: userId,
                    nodeId: nodeId,
                    targetNode: routing?.target,
                },
                task
            );
        });

        return flow ? flow : null;
    } catch (error) {
        throw error;
    }
};
