"use strict";

import express from "express";
import * as flowController from "../controllers/flowController.js";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import checkLogin from "../middlewares/checkLoginMiddleware.js";
import Producer from "../config/rabbitMQ.js";

const router = express.Router();

router.get("/", flowController.getAll);
router.get("/getById/:flowId", flowController.getById);
router.post("/createFlow", flowController.createFlow);
router.put("/:flowId", flowController.updateFlow);
router.patch("/:flowId", flowController.updateFlow);
router.delete("/:flowId", flowController.deleteFlow);

router.post("/publishLead", async (req, res) => {
    try {
        const result = await Producer.publishMessage(
            "pre-verify",
            "pre-verify.67b1c1331e12c93a79317bbb.67dfd768bcf92635cb7753a9",
            req.body
        );
        res.status(200).json({ message: "Lead published successfully", result });
    } catch (error) {
        res.status(500).json({ message: "Failed to publish lead", error: error.message });
    }
});

router.post("/callLead", async (req, res) => {
    try {
        let task = req.body;

        const response = await fetch(
            "https://callflow143.primas.net:1501/system/CallFlow/outreach/195",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI5MTZjNjgzMi00YjZjLTQ5ZDAtOTA3OC1mMzIxOGUwNjgyNDgiLCJuYW1lIjoiYWRtaW5AcHJpbWFzLm5ldCIsInJvbGUiOiI5OTktU3VwZXJBZG1pbiIsImxhc3Rsb2dpbiI6IjUvMjYvMjAyMyAxMDoxMDo0OSBBTSIsInBpY3R1cmUiOiIiLCJuYmYiOjE2ODUwNzA2NTUsImV4cCI6MjAwMDY4OTg0OSwiaWF0IjoxNjg1MDcwNjU1fQ.dnGhU1U72CI2k_BOS2IU1j1Bk5D8YSfv1ZD505_vUEc`,
                },
                body: JSON.stringify({
                    phoneNumber: task.phoneNumber,
                    callerId: task.callerId || "",
                    callerNumber: task.callerNumber,
                    attribute: JSON.stringify(task.attribute),
                    outreachType: task.outreachType || "phonecall",
                    ExtendData: task.ExtendData || {},
                }),
            }
        );

        console.log(`Response Status: ${response.status}`);
        res.status(response.status).json({ response: response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

export default router;
