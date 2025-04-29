import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { isLoggedIn } from "../services/authService.js";
import config from "../config/environment.js";

// Modify auth to return a middleware function
const checkLogin = () => {
    return async (req, res, next) => {
        try {
            if (req?.cookies?.accessToken || req?.cookies?.refreshToken) {
                console.log(req?.cookies);
                return res.redirect(`${config.feRedirectUri}`);
            }
            next();
        } catch (err) {
            next(err);
        }
    };
};

export default checkLogin;
