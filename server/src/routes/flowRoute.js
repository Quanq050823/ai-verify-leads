"use strict";

import express from "express";
import * as flowController from "../controllers/flowController.js";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import checkLogin from "../middlewares/checkLoginMiddleware.js";

const router = express.Router();

router.get("/", flowController.getAll);
router.get("/getById/:flowId", flowController.getById);
router.post("/createFlow", flowController.createFlow);
router.put("/:flowId", flowController.updateFlow);
router.patch("/:flowId", flowController.updateFlow);
router.delete("/:flowId", flowController.deleteFlow);

export default router;
