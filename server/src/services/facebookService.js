// services/facebookService.js

import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import getObjectId from "./../utils/objectId.js";

export const updateConnection = async (userId, provider = "facebook", profile) => {
    try {
        // console.log("facebookProfile", profile);

        let user;
        let isExisted = await User.findOne(
            {
                _id: userId,
                "adsConnection.profile.id": profile?.id,
                "adsConnection.provider": provider,
            },
            {
                "adsConnection.$": 1, // This will return only the matched element in the array
            }
        );

        if (isExisted) {
            const newProfile = {
                ...profile,
                accessToken: isExisted?.adsConnection[0].profile.accessToken,
            };

            user = await User.findOneAndUpdate(
                { _id: userId, "adsConnection.profile.id": profile.id },
                {
                    $set: {
                        "adsConnection.$.profile": newProfile,
                    },
                },
                {
                    new: true,
                    select: "-password -federatedCredentials -refreshToken -otp -isVerified",
                }
            );
        } else {
            const newAccessToken = await exchangeLongLivedToken(profile?.accessToken);
            profile.accessToken = newAccessToken;

            user = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $push: {
                        adsConnection: {
                            provider,
                            profile,
                            pages: [],
                            forms: [],
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
    try {
        const facebookConfig = config.facebookAuthConfig;

        const params = new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: facebookConfig.appId,
            client_secret: facebookConfig.appSecret,
            fb_exchange_token: shortToken,
        });

        const res = await fetch(`https://graph.facebook.com/v22.0/oauth/access_token?${params}`);
        if (!res.ok)
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to exchange token");
        return (await res.json()).access_token;
    } catch (error) {
        throw error;
    }
};

export const getUserPages = async (profileId, userId) => {
    try {
        let user = await User.findOne(
            {
                _id: userId,
                "adsConnection.profile.id": profileId,
            },
            {
                "adsConnection.$": 1, // This will return only the matched element in the array
            }
        );

        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        const res = await fetch(
            `https://graph.facebook.com/v22.0/me/accounts?access_token=${user?.adsConnection[0]?.profile?.accessToken}`
        );
        if (!res.ok) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to get pages");

        let response = await res.json();
        let pagesData = response.data;

        const pageMap = new Map(user?.adsConnection[0]?.pages.map((p) => [p.id, p]) || []);

        pagesData = pagesData.map((page) => {
            let currentPage = pageMap.get(page.id);
            return {
                ...page,
                forms: currentPage ? currentPage.forms : [],
            };
        });

        user = await User.findOneAndUpdate(
            { _id: userId, "adsConnection.profile.id": profileId },
            { $set: { "adsConnection.$.pages": pagesData } },
            { select: "-password -federatedCredentials -refreshToken -otp -isVerified" }
        );

        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        return user;
    } catch (error) {
        throw error;
    }
};

export const getForms = async (pageId, userId) => {
    try {
        // Step 1: Find user with the specific page
        let user = await User.findOne(
            {
                _id: userId,
                "adsConnection.pages.id": pageId,
            },
            {
                "adsConnection.$": 1, // Return the matched adsConnection element
            }
        );

        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        const page = user.adsConnection[0]?.pages.find((p) => p.id === pageId);

        // Step 2: Fetch forms from Facebook API
        const res = await fetch(
            `https://graph.facebook.com/v22.0/${pageId}/leadgen_forms?access_token=${page.access_token}`
        );

        if (!res.ok) throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch forms");

        const resData = await res.json();
        const forms = resData.data.map((form) => ({ ...form }));

        // Step 3: Update user with the forms in the correct page
        user = await User.findOneAndUpdate(
            { _id: userId, "adsConnection.pages.id": pageId },
            {
                $set: {
                    "adsConnection.$[ad].pages.$[page].forms": forms,
                },
            },
            {
                arrayFilters: [{ "ad.pages.id": pageId }, { "page.id": pageId }],
                new: true,
                select: "-password -federatedCredentials -refreshToken -otp -isVerified",
            }
        );

        return user;
    } catch (error) {
        throw error;
    }
};

export const subscribePageToWebhook = async (pageId, userId) => {
    try {
        let user = await User.findOne(
            {
                _id: getObjectId(userId),
                "adsConnection.pages.id": pageId,
            },
            {
                "adsConnection.$": 1, // Return the matched adsConnection element
            }
        );

        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        const page = user.adsConnection[0]?.pages.find((p) => p.id === pageId);

        const res = await fetch(`https://graph.facebook.com/v22.0/${pageId}/subscribed_apps`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                access_token: page.access_token,
                subscribed_fields: ["leadgen"],
            }),
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to subscribe page: ${error}`);
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
};

export const unsubscribePageFromWebhook = async (pageId, userId, appId) => {
    let user = await User.findOne(
        {
            _id: getObjectId(userId),
            "adsConnection.pages.id": pageId,
        },
        {
            "adsConnection.$": 1, // Return the matched adsConnection element
        }
    );

    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    const page = user.adsConnection[0]?.pages.find((p) => p.id === pageId);

    const res = await fetch(`https://graph.facebook.com/v22.0/${pageId}/subscribed_apps`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            access_token: page.access_token,
            app_id: appId,
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

export const getPageByUserAndPageId = async (userId, pageId) => {
    try {
        let user = await User.findOne(
            {
                _id: userId,
                "adsConnection.pages.id": pageId,
            },
            {
                "adsConnection.$": 1, // This will return only the matched element in the array
            }
        );

        if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

        const page = user.adsConnection[0]?.pages.find((p) => p.id === pageId);
        return page;
    } catch (error) {
        throw error;
    }
};
