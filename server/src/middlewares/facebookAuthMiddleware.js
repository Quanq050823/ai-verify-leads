import passport from "passport";
import FacebookStrategy from "passport-facebook";
import User from "../models/user.js";
import config from "../config/environment.js";

passport.use(
    new FacebookStrategy(
        {
            clientID: config.facebookAuthConfig.appId,
            clientSecret: config.facebookAuthConfig.appSecret,
            callbackURL: `${config.beURL}${config.facebookAuthConfig.callBackUrl}`,
            profileFields: ["id", "displayName", "name", "emails", "photos"],
            passReqToCallback: true,
        },
        function (req, accessToken, refreshToken, profile, cb) {
            try {
                const facebookProfile = {
                    id: profile.id, //Profile ID
                    name: profile.displayName,
                    email: profile.emails?.[0]?.value || "",
                    accessToken,
                    refreshToken,
                    photo: profile.photos?.[0]?.value || "",
                };
                req.facebookProfile = facebookProfile;
                return cb(null, {});
            } catch (err) {
                return cb(err, null);
            }
        }
    )
);

passport.serializeUser((facebookProfile, done) => {
    done(null, facebookProfile);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
