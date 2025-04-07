"use strict";

import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import getObjectId from "../utils/getObjectId.js";
import Producer from "../config/rabbitMQ.js";
import Flow from "../models/flow.js";

export const getFlows = async (user) => {
    try {
        let flows = await Flow.find({ createdBy: user.userId });
        return flows ? flows : null;
    } catch (error) {
        throw error;
    }
};

export const getFlow = async (flowId, user) => {
    try {
        let flow = await Flow.findOne({ _id: getObjectId(flowId), createdBy: user.userId });
        return flow ? flow : null;
    } catch (error) {
        throw error;
    }
};

export const createFlow = async (data, user) => {
    try {
        let { flowName, nodeData } = data;

        //Check if flow name already exists
        let flowExists = await Flow.findOne({
            name: flowName,
            createdBy: user.userId,
            status: { $ne: 0 },
        });
        if (flowExists) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Flow name already exists");
        }

        let routeData = nodeData?.edges?.map((edge) => {
            return {
                source: edge.source,
                target: edge.target,
            };
        });

        let flow = new Flow({
            name: flowName,
            routeData,
            nodeData,
            createdBy: getObjectId(user.userId),
        });

        let result = await flow.save();

        //Create queue for each nodes in RabbitMQ
        nodeData?.nodes?.forEach((node) => {
            Producer.createExchange(node?.type);
            Producer.createQueue(
                `${user.userId}.${flow._id}.${node.id}`,
                node?.type,
                `${user.userId}.${flow._id}.${node.id}`
            );
        });

        return result ? result : null;
    } catch (error) {
        throw error;
    }
};

export const updateFlow = async (flowId, data, user) => {
    try {
        let { flowName, nodeData } = data;

        let flow = await Flow.findOne({ _id: getObjectId(flowId), createdBy: user.userId });
        if (!flow) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Flow not found");
        }

        flow.name = flowName || flow.name;
        flow.nodeData = nodeData || flow.nodeData;
        flow.lastModified = new Date();

        let result = await flow.save();
        return result ? result : null;
    } catch (error) {
        throw error;
    }
};

export const updateStatus = async (flowId, status, user) => {
    try {
        let flow = await Flow.findOne({ _id: getObjectId(flowId), createdBy: user.userId });
        if (!flow) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Flow not found");
        }

        let errMsg = "";
        if (status == flow.status) {
            switch (status) {
                case 0:
                    errMsg = "Flow is already deleted";
                    break;
                case 1:
                    errMsg = "Flow is already disabled";
                    break;
                case 2:
                    errMsg = "Flow is already active";
                    break;
                default:
                    break;
            }
            throw new ApiError(StatusCodes.BAD_REQUEST, errMsg);
        }

        flow.status = status;
        flow.lastModified = new Date();

        let result = await flow.save();

        if (flow.status == 0) {
            console.log("Deleting queue...");
            flow?.nodeData?.nodes?.forEach((node) => {
                Producer.deleteQueue(`${user.userId}.${flow._id}.${node.id}`, node?.type);
            });
        }

        return result ? result : null;
    } catch (error) {
        throw error;
    }
};
