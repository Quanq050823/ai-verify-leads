// "use strict";

// import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import webhookRoute from "./webhookRoute.js";
import flowRoute from "./flowRoute.js";
import nodeTypeRoute from "./nodeTypeRoute.js";
import leadRoute from "./leadRoute.js";
import facebookRoute from "./facebookRoute.js";
import userRoute from "./userRoute.js";
import calendarRoute from "./calendarRoute.js";

import { errorHandlingMiddleware } from "./../middlewares/errorHandlingMiddleware.js";
import authenticate from "../middlewares/jwtMiddlewares.js";
export default (app) => {
    // Basic GET route for API status check
    app.get("/", (req, res) => {
        res.status(200).json({ status: "ok", message: "API is running" });
    });
    app.use("/api/auth", authRoute);
    app.use("/api/hooks", webhookRoute);
    app.use("/api/flow", authenticate, flowRoute);
    app.use("/api/nodeType", nodeTypeRoute);
    app.use("/api/lead", authenticate, leadRoute);
    // app.use("/api/facebook", authenticate, facebookRoute);
    app.use("/api/facebook", facebookRoute);
    app.use("/api/user", authenticate, userRoute);
    app.use("/api/calendar", calendarRoute);

    // app.use("/api/role", authenticate, roleRoute);
    app.use(errorHandlingMiddleware);
};
