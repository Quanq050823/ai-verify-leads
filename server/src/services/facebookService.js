// services/facebookService.js

import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";

export const updateConnection = async (userId, provider = "facebook", profile) => {
    try {
        // console.log("facebookProfile", profile);

        let user;
        let isExisted = await User.findOne({
            _id: userId,
            "adsConnection.profile.id": profile?.id,
            "adsConnection.provider": provider,
        });

        const newAccessToken = await exchangeLongLivedToken(profile?.accessToken);
        profile.accessToken = newAccessToken;

        if (isExisted) {
            user = await User.findOneAndUpdate(
                { _id: userId, "adsConnection.profile.id": profile.id },
                {
                    $set: {
                        "adsConnection.$.profile": profile,
                    },
                },
                {
                    new: true,
                    select: "-password -federatedCredentials -refreshToken -otp -isVerified",
                }
            );
        } else {
            user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $push: {
                        adsConnection: {
                            provider,
                            profile,
                        },
                    },
                },
                {
                    new: true,
                    select: "-password -federatedCredentials -refreshToken -otp -isVerified",
                }
            );
        }

        return user;
    } catch (error) {
        throw error;
    }
};

export const exchangeLongLivedToken = async (shortToken) => {
    const facebookConfig = config.facebookAuthConfig;

    const params = new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: facebookConfig.appId,
        client_secret: facebookConfig.appSecret,
        fb_exchange_token: shortToken,
    });

    const res = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?${params}`);
    if (!res.ok) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to exchange token");
    return (await res.json()).access_token;
};

export const getUserPages = async (userAccessToken) => {
    const res = await fetch(
        `https://graph.facebook.com/v22.0/me/accounts?access_token=${userAccessToken}`
    );
    if (!res.ok) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to get pages");
    return (await res.json()).data;
};

export const getForms = async (pageId, pageAccessToken) => {
    const res = await fetch(
        `https://graph.facebook.com/v22.0/${pageId}/leadgen_forms?access_token=${pageAccessToken}`
    );
    if (!res.ok) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch forms");

    const formsData = await res.json();
    const forms = formsData.data.map((form) => ({
        ...form,
    }));

    return forms;
};

export const subscribePageToWebhook = async (pageId, pageAccessToken) => {
    const res = await fetch(`https://graph.facebook.com/v22.0/${pageId}/subscribed_apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_token: pageAccessToken,
            subscribed_fields: ["leadgen"],
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to subscribe page: ${error}`);
    }

    return await res.json();
};

export const unsubscribePageFromWebhook = async (pageId, pageAccessToken, appId) => {
    // The correct endpoint for unsubscribing
    const res = await fetch(`https://graph.facebook.com/v22.0/${pageId}/subscribed_apps`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_token: pageAccessToken,
            app_id: appId, // Pass app_id in the body instead
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to unsubscribe page: ${error}`);
    }

    return await res.json();
};

export const getLeadDetails = async (leadgenId, pageAccessToken) => {
    const res = await fetch(
        `https://graph.facebook.com/v22.0/${leadgenId}?access_token=${pageAccessToken}`
    );
    if (!res.ok) throw new Error("Failed to fetch lead data");
    return await res.json();
};
