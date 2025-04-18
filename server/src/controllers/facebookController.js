import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as services from "../services/facebookService.js";
import config from "../config/environment.js";

export const createUser = async (req, res, next) => {
    try {
        let user = req.user;
        const newAccessToken = await services.exchangeLongLivedToken(user?.accessToken);
        user.accessToken = newAccessToken;

        console.log("accessToken", newAccessToken);

        const pages = await services.getUserPages(newAccessToken);
        const forms = await services.getForms(pages[0].id, pages[0].access_token);

        console.log("page access token", pages[0].access_token);

        const subscribe = await services.subscribePageToWebhook(pages[0].id, pages[0].access_token);

        // const unsubscribe = await services.unsubscribePageFromWebhook(
        //     pages[0].id,
        //     pages[0].access_token,
        //     config.facebookAuthConfig.appId
        // );

        res.status(StatusCodes.CREATED).send(subscribe);
    } catch (err) {
        next(err);
    }
};
