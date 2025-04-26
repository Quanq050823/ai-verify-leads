"use strict";

import express from "express";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import * as controller from "../controllers/calendarController.js";
import checkLogin from "../middlewares/checkLoginMiddleware.js";
import authenticate from "../middlewares/jwtMiddlewares.js";

const router = express.Router();

router.get("/getUrl", authenticate, controller.getAuthLink);
router.get("/google/callback", controller.handleAuthCallback);

export default router;
