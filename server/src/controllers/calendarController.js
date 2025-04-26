import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import * as services from "../services/googleCalendarService.js";
import config from "../config/environment.js";

// let userId = "67b1c1331e12c93a79317bbb";
export const getAuthLink = async (req, res, next) => {
    try {
        let userId = req?.user?.userId;
        let url = services.generateAuthUrl(userId);

        res.status(StatusCodes.CREATED).send({ url: url });
    } catch (err) {
        next(err);
    }
};

export const handleAuthCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        const parsedState = typeof state === "string" ? JSON.parse(state) : state;
        const userId = parsedState.userId;

        const tokens = await services.getTokens(code, userId);

        // const calendarId = await services.createCalendar(tokens);

        // Save tokens and calendarId to the database for the user
        // await saveTokensAndCalendarId(userId, tokens, calendarId);

        res.status(StatusCodes.OK).json(tokens);
    } catch (err) {
        next(err);
    }
};
