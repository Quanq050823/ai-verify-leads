import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as facebookServices from "../services/facebookService.js";
import * as userServices from "../services/userService.js";
import config from "../config/environment.js";

export const connectFacebook = async (req, res, next) => {
    try {
        const userId = req.query.state;
        // console.log("Connected Facebook for userId:", state);

        let facebookProfile = req.facebookProfile;

        let user = await facebookServices.updateConnection(userId, "facebook", facebookProfile);

        // res.status(StatusCodes.CREATED).send(user);
        res.redirect(`${config.feUrl}${config.facebookAuthConfig.connectRedirectPath}`);
    } catch (err) {
        next(err);
    }
};

export const getPages = async (req, res, next) => {
    try {
        let userId = req?.user?.userId;
        const { profileId } = req.params;
        const pages = await facebookServices.getUserPages(profileId, userId);
        res.status(StatusCodes.OK).send(pages);
    } catch (err) {
        next(err);
    }
};

export const getForm = async (req, res, next) => {
    try {
        let userId = req?.user?.userId;
        const { pageId } = req.params;
        const forms = await facebookServices.getForms(pageId, userId);
        res.status(StatusCodes.OK).send(forms);
    } catch (err) {
        next(err);
    }
};

export const subscribePage = async (req, res, next) => {
    try {
        let userId = req?.user?.userId;
        const { pageId } = req.params;
        const subscribe = await facebookServices.subscribePageToWebhook(pageId, userId);
        res.status(StatusCodes.OK).send(subscribe);
    } catch (err) {
        next(err);
    }
};

export const unsubscribePage = async (req, res, next) => {
    try {
        let userId = req?.user?.userId;

        const { pageId } = req.params;
        const unsubscribe = await facebookServices.unsubscribePageFromWebhook(
            pageId,
            userId,
            config.facebookAuthConfig.appId
        );
        res.status(StatusCodes.OK).send(unsubscribe);
    } catch (err) {
        next(err);
    }
};
