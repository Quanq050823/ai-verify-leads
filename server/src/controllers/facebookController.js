import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as facebookServices from "../services/facebookService.js";
import * as userServices from "../services/userService.js";
import config from "../config/environment.js";

export const connectFacebook = async (req, res, next) => {
    try {
        // let userId = req?.user?.userId;
        let userId = "67b1c1331e12c93a79317bbb";
        let facebookProfile = req.facebookProfile;

        let user = await facebookServices.updateConnection(userId, "facebook", facebookProfile);

        res.status(StatusCodes.CREATED).send(user);
    } catch (err) {
        next(err);
    }
};

export const getPages = async (req, res, next) => {
    try {
        const { accessToken } = req.params;
        const pages = await facebookServices.getUserPages(accessToken);
        res.status(StatusCodes.OK).send(pages);
    } catch (err) {
        next(err);
    }
};

export const getForm = async (req, res, next) => {
    try {
        const { pageId, accessToken } = req.params;
        const forms = await facebookServices.getForms(pageId, accessToken);
        res.status(StatusCodes.OK).send(forms);
    } catch (err) {
        next(err);
    }
};

export const unsubscribePage = async (req, res, next) => {
    try {
        const { pageId } = req.params;
        const unsubscribe = await facebookServices.unsubscribePageFromWebhook(
            pageId,
            config.facebookAuthConfig.appId,
            config.facebookAuthConfig.appSecret
        );
        res.status(StatusCodes.OK).send(unsubscribe);
    } catch (err) {
        next(err);
    }
};
