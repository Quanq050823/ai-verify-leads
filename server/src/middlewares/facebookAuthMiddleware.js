import passport from "passport";
import FacebookStrategy from "passport-facebook";
import User from "../models/user.js";
import config from "../config/environment.js";

passport.use(
    new FacebookStrategy(
        {
            clientID: config.facebookAuthConfig.appId,
            clientSecret: config.facebookAuthConfig.appSecret,
            callbackURL: config.facebookAuthConfig.callBackUrl,
            profileFields: ["id", "displayName", "name", "emails", "photos"],
            passRequestToCallback: true,
        },
        function (accessToken, refreshToken, profile, cb) {
            try {
                const user = {
                    facebookId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value || "",
                    accessToken,
                    refreshToken,
                    profile,
                };

                return cb(null, user);
            } catch (err) {
                return cb(err, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
