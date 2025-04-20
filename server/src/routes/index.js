// "use strict";

// import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import webhookRoute from "./webhookRoute.js";
import flowRoute from "./flowRoute.js";
import nodeTypeRoute from "./nodeTypeRoute.js";
import facebookRoute from "./facebookRoute.js";
import userRoute from "./userRoute.js";

import { errorHandlingMiddleware } from "./../middlewares/errorHandlingMiddleware.js";
import authenticate from "../middlewares/jwtMiddlewares.js";
export default (app) => {
    app.use("/api/auth", authRoute);
    app.use("/api/hooks", webhookRoute);
    app.use("/api/flow", authenticate, flowRoute);
    app.use("/api/nodeType", nodeTypeRoute);
    // app.use("/api/facebook", authenticate, facebookRoute);
    app.use("/api/facebook", facebookRoute);
    app.use("/api/user", authenticate, userRoute);

    // app.use("/api/role", authenticate, roleRoute);
    app.use(errorHandlingMiddleware);
};
