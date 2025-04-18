"use strict";

import express from "express";
import * as controller from "../controllers/webhookController.js";
import("../middlewares/googleAuthMiddleware.js");

const router = express.Router();

router.post("/appScript/:userId/:flowId/:nodeId", controller.getByAppScript);

export default router;
