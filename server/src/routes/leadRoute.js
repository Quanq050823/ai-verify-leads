"use strict";

import express from "express";
import * as controller from "../controllers/leadController.js";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import Producer from "../config/rabbitMQ.js";
import authenticate from "../middlewares/jwtMiddlewares.js";

const router = express.Router();

router.get("/", authenticate, controller.getAllLeads);
router.get("/:leadId", authenticate, controller.getLeadById);
router.get("/mergeNodes/:flowId", authenticate, controller.getLeadByNodes);
router.post("/retry/:leadId", authenticate, controller.retryLead);
router.post("/publish", controller.publishLead);

export default router;
