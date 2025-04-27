import { google } from "googleapis";
import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";

import * as userService from "../services/userService.js";
import { calendar } from "googleapis/build/src/apis/calendar/index.js";

export function getOAuth2Client() {
    return new google.auth.OAuth2(
        config.googleAuthConfig.clientId,
        config.googleAuthConfig.clientSecret,
        config.googleAuthConfig.calendarRedirectUri
    );
}

export function generateAuthUrl(userId) {
    try {
        const oauth2Client = getOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
            prompt: "consent",
            state: JSON.stringify({ userId: userId }),
        });
    } catch (error) {
        console.error("Error generating auth URL:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to generate auth URL");
    }
}

export async function getTokens(code, userId) {
    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        // Get user's email address from Google using tokens
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: "v2",
        });
        const userInfo = await oauth2.userinfo.get();

        // Save tokens to the database for the user
        let user = await User.findOne({
            _id: userId,
            "calendarConnection.provider": "google",
            "calendarConnection.profile.email": userInfo.data.email,
        });

        if (user) {
            // Update existing tokens
            user.calendarConnection = user.calendarConnection.map((connection) => {
                if (
                    connection.provider === "google" &&
                    connection.profile.email === userInfo.data.email
                ) {
                    return { ...connection, tokens: tokens };
                }
                return connection;
            });
            await user.save();
        } else {
            // Create new calendar connection
            const newConnection = {
                provider: "google",
                profile: userInfo.data,
                tokens,
            };
            user = await User.findByIdAndUpdate(
                userId,
                { $push: { calendarConnection: newConnection } },
                { new: true }
            );
        }

        return user?.calendarConnection;
    } catch (error) {
        console.error("Error getting tokens:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
}

export async function createCalendar(tokens) {
    try {
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials(tokens);

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const res = await calendar.calendars.insert({
            requestBody: {
                summary: "Lead Booking Calendar",
                timeZone: "UTC",
            },
        });
        return res.data.id; // Return calendarId
    } catch (error) {
        console.error("Error creating calendar:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create calendar");
    }
}
