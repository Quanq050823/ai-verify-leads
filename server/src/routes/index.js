// "use strict";

// import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import hookRoute from "./hookRoute.js";
import flowRoute from "./flowRoute.js";
import nodeTypeRoute from "./nodeTypeRoute.js";

import { errorHandlingMiddleware } from "./../middlewares/errorHandlingMiddleware.js";
import authenticate from "../middlewares/jwtMiddlewares.js";
export default (app) => {
    app.use("/api/auth", authRoute);
    app.use("/api/hooks", hookRoute);
    app.use("/api/flow", authenticate, flowRoute);
    app.use("/api/nodeType", nodeTypeRoute);
    // app.use("/api/user", authenticate, userRoute);
    // app.use("/api/project", authenticate, projectRoute);
    // app.use("/api/issue-type", authenticate, issueTypeRoute);
    // app.use("/api/issue", authenticate, issueRoute);
    // app.use("/api/sprint", authenticate, sprintRoute);
    // app.use("/api/workflow", authenticate, workflowRoute);
    // app.use("/api/comment", authenticate, commentRoute);
    // app.use("/api/role", authenticate, roleRoute);
    app.use(errorHandlingMiddleware);
};
