"use strict";

import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
// import * as authService from "../services/authService.js";
import config from "../config/environment.js";

export const getHooks = async (req, res, next) => {
    try {
        console.log(req.body);
        // let result = await authService.registerService(req.body);
        // res.status(StatusCodes.CREATED).send(result);
        res.status(200).json({ message: "Webhook received successfully" });
    } catch (err) {
        next(err);
    }
};
