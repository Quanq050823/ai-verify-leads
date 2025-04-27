"use strict";

import express from "express";
import validate from "../middlewares/validationMiddleware.js";
import authenticate from "../middlewares/jwtMiddlewares.js";
import passport from "passport";
import * as controller from "../controllers/facebookController.js";
import checkLogin from "../middlewares/checkLoginMiddleware.js";
import("../middlewares/facebookAuthMiddleware.js");

const router = express.Router();

router.get("/connect/:userId", (req, res, next) => {
	passport.authenticate("facebook", {
		scope: [
			"email",
			"public_profile",
			"ads_management",
			"pages_show_list",
			"leads_retrieval",
			"pages_read_engagement",
			"pages_manage_metadata",
			"pages_manage_ads",
		],
		state: req?.params?.userId,
	})(req, res, next);
});
router.get(
	"/callback",
	passport.authenticate("facebook", {
		failureRedirect: "/auth/api/login",
		failureMessage: true,
		session: false,
	}),
	controller.connectFacebook
);
router.get("/pages/:profileId", authenticate, controller.getPages);
router.get("/forms/:pageId", authenticate, controller.getForm);
router.post("/subscribePage/:pageId", authenticate, controller.subscribePage);
router.delete(
	"/unsubscribePage/:pageId",
	authenticate,
	controller.unsubscribePage
);

export default router;
