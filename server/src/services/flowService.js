"use strict";

import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import getObjectId from "../utils/getObjectId.js";
import Producer from "../config/rabbitMQ.js";
import Flow from "../models/flow.js";

export const checkFlowExists = async (flowId, userId) => {
    try {
        let flowExists = await Flow.findOne({
            _id: getObjectId(flowId),
            userId: getObjectId(userId),
            status: { $ne: 0 },
        });
        return flowExists ? flowExists : false;
    } catch (error) {
        throw error;
    }
};

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
        await nodeData?.nodes?.forEach((node) => {
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

        let flow = await Flow.findOne({ _id: getObjectId(flowId), userId: user.userId });
        if (!flow) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Flow not found");
        }

        let oldNodeData = flow.nodeData != nodeData ? flow.nodeData : null;

        flow.name = flowName || flow.name;
        flow.nodeData = nodeData || flow.nodeData;
        flow.routeData = nodeData?.edges?.map((edge) => {
            return {
                source: edge.source,
                target: edge.target,
            };
        });

        let result = await flow.save();

        if (oldNodeData) {
            //Delete old queue
            oldNodeData?.nodes?.forEach(async (node) => {
                await Producer.deleteQueue(`${user.userId}.${flow._id}.${node.id}`, node?.type);
            });

            //Create new queue for each nodes in RabbitMQ
            flow.nodeData?.nodes?.forEach(async (node) => {
                await Producer.createExchange(node?.type);
                await Producer.createQueue(
                    `${user.userId}.${flow._id}.${node.id}`,
                    node?.type,
                    `${user.userId}.${flow._id}.${node.id}`
                );
            });
        }

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

        if (flow.status == 0 || flow.status == 1) {
            console.log("Deleting queue...");
            flow?.nodeData?.nodes?.forEach(async (node) => {
                await Producer.deleteQueue(`${user.userId}.${flow._id}.${node.id}`, node?.type);
            });
        } else if (flow.status == 2) {
            flow?.nodeData?.nodes?.forEach(async (node) => {
                await Producer.createExchange(node?.type);
                await Producer.createQueue(
                    `${user.userId}.${flow._id}.${node.id}`,
                    node?.type,
                    `${user.userId}.${flow._id}.${node.id}`
                );
            });
        }

        return result ? result : null;
    } catch (error) {
        throw error;
    }
};

export const resetQueue = async () => {
    try {
        let flows = await Flow.find({ status: 2 });
        flows.forEach((flow) => {
            flow?.nodeData?.nodes?.forEach(async (node) => {
                await Producer.createExchange(node?.type);
                await Producer.createQueue(
                    `${flow.createdBy}.${flow._id}.${node.id}`,
                    node?.type,
                    `${flow.createdBy}.${flow._id}.${node.id}`
                );
            });
        });
        return { status: true, message: "Queue reset successfully" };
    } catch (error) {
        throw error;
    }
};

export const getFacebookLeadFlow = async (pageId, formId) => {
    try {
        const flow = await Flow.find({
            "nodeData.nodes.type": "facebookLeadAds",
            "nodeData.nodes.data.settings.page": pageId,
            "nodeData.nodes.data.settings.form": formId,
        });
        if (!flow) {
            console.log("Flow not found for the given pageId and formId.");
            return null;
        }
        return flow ? flow : null;
    } catch (error) {
        throw error;
    }
};
