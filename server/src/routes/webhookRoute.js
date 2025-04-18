"use strict";

import express from "express";
import * as controller from "../controllers/webhookController.js";
import("../middlewares/googleAuthMiddleware.js");

const router = express.Router();

router.post("/appScript/:userId/:flowId/:nodeId", controller.getByAppScript);
router.get("/facebook", (req, res) => {
    console.log("Facebook Webhook: ", req.query);

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
});

router.post("/facebook", express.json(), async (req, res) => {
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
});

export default router;
