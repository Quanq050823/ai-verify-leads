"use strict";

import express from "express";
import validate from "../middlewares/validationMiddleware.js";
import passport from "passport";
import * as controller from "../controllers/facebookController.js";
import checkLogin from "../middlewares/checkLoginMiddleware.js";
import("../middlewares/facebookAuthMiddleware.js");

const router = express.Router();

router.get(
    "/connect",
    passport.authenticate("facebook", {
        scope: [
            "email",
            "public_profile",
            "ads_management",
            "pages_show_list",
            "leads_retrieval",
            "pages_read_engagement",
            "pages_manage_metadata",
        ],
    })
);
router.get(
    "/callback",
    passport.authenticate("facebook", {
        failureRedirect: "/auth/api/login",
        failureMessage: true,
        session: false,
    }),
    controller.connectFacebook
);
router.get("/pages/:accessToken", controller.getPages);
router.get("/forms/:pageId/:accessToken", controller.getForm);
router.post("/subscribePage/:pageId/:pageAccessToken", controller.subscribePage);
router.delete("/unsubscribePage/:pageId/:pageAccessToken", controller.unsubscribePage);

export default router;
