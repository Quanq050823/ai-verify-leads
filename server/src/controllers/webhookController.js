"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as services from "../services/webhookService.js";
import config from "../config/environment.js";
import convertLeadData from "../utils/convertLeadData.js";

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

export const verifyWebhook = async (req, res, next) => {
    try {
        // console.log("Facebook Webhook: ", req.query);

        const VERIFY_TOKEN = "FacebookVerificationToken"; // match this with what you gave Facebook

        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // ✅ Return the challenge token from the request
            res.status(200).send(challenge);
        } else {
            // ❌ Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    } catch (err) {
        next(err);
    }
};

export const retrieveLead = async (req, res, next) => {
    try {
        const body = req.body;

        let result = await services.retrieveFaceBookLead(body);

        return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
        console.error("❌ Unexpected error in retrieveLead:", err);
        next(err);
    }
};

export const transcribe = async (req, res, next) => {
    try {
        res.status(StatusCodes.OK).json({ message: "Transcription request received" });
        await services.getTranscript(req.body);
    } catch (err) {
        next(err);
    }
};
