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

const PAGE_ACCESS_TOKEN =
    "EAAQvKWZCZAU9ABO9MAsrJ1NPtrZAGosfxXrTb89yih9nqZBOhjky0Cka5XTsj2njyZB6pjG2r8UMMbyA6ZBqa7M6O7oIPgUkdkMusqhgLwEqHMTaicaqXozFuCW7AM3pUzvgNnGAmZARnPQfALv1XwXZBliZBCmWgTSmzNbFV9ANX2QUM3D1tcpzbqbLViUa1zc2SmDpO9nFPy5ht";

export const retrieveLead = async (req, res, next) => {
    try {
        const body = req.body;

        if (body.object !== "page") {
            return res.status(400).json({ message: "Unsupported event type" });
        }

        await Promise.all((body.entry || []).map(handleEntry));

        return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
        console.error("❌ Unexpected error in retrieveLead:", err);
        next(err);
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
        console.error("❌ Failed to process lead:", err.message);
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
