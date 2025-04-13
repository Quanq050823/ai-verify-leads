"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as services from "../services/webhookService.js";
import config from "../config/environment.js";

export const getByAppScript = async (req, res, next) => {
    try {
        let { userId, flowId, nodeId } = req.params;
        if (!userId || !flowId || !nodeId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required parameters.");
        }

        // console.log("Received request:", req.body);
        let result = await services.appScript(userId, req.body, flowId, nodeId);
        res.status(StatusCodes.CREATED).json({ result });
    } catch (err) {
        next(err);
    }
};
