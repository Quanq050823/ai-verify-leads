import { google } from "googleapis";
import config from "../config/environment.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import { calendar } from "googleapis/build/src/apis/calendar/index.js";

export function generateAuthUrl(userId, type) {
    try {
        let scope = [];

        switch (type) {
            case "calendar":
                scope = [
                    "https://www.googleapis.com/auth/calendar",
                    "https://www.googleapis.com/auth/calendar.events",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile",
                ];
                break;
            case "drive":
                scope = [
                    "https://www.googleapis.com/auth/drive.file",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile",
                ];
                break;
            case "gmail":
                scope = [
                    "https://www.googleapis.com/auth/gmail.readonly",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile",
                ];
                break;
            case "sheets":
                scope = [
                    "https://www.googleapis.com/auth/spreadsheets",
                    "https://www.googleapis.com/auth/userinfo.email",
                    "https://www.googleapis.com/auth/userinfo.profile",
                ];
                break;
        }

        const oauth2Client = getOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope,
            prompt: "consent",
            state: JSON.stringify({ userId: userId }),
        });
    } catch (error) {
        console.error("Error generating auth URL:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to generate auth URL");
    }
}
