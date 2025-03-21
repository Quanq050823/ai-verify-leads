"use strict";

import express from "express";
import * as userRequest from "../validations/userValidation.js";
import * as hookController from "../controllers/hookController.js";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import checkLogin from "../middlewares/checkLoginMiddleware.js";
import("../middlewares/googleAuthMiddleware.js");

const router = express.Router();

router.post("/", hookController.getHooks);

export default router;
