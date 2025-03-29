"use strict";

import express from "express";
import * as controller from "../controllers/nodeTypeController.js";
import validate from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:nodeTypeId", controller.getById);
router.post("/createNodeType", controller.createNodeType);
router.put("/:nodeTypeId", controller.updateNodeType);
router.delete("/:nodeTypeId", controller.deleteNodeType);

export default router;
