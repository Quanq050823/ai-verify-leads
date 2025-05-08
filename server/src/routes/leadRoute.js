"use strict";

import express from "express";
import * as controller from "../controllers/leadController.js";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import Producer from "../config/rabbitMQ.js";

const router = express.Router();

router.get("/", controller.getAllLeads);
router.get("/:leadId", controller.getLeadById);
router.get("/mergeNodes/:flowId", controller.getLeadByNodes);

export default router;
