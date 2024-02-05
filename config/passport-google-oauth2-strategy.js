/* eslint-disable consistent-return */
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const crypto = require("crypto");
const User = require("../models/user");
const env = require("./environment");
const App = require("../models/app");

// tell passport to use a new strategy for google login
passport.use(
  new GoogleStrategy(
    {
      clientID: env.google_clientID,
      clientSecret: env.google_clientSecret,
      callbackURL: env.google_callbackURL,
      proxy: true,
      passReqToCallback: true,
    },

    async function (request, accessToken, refreshToken, profile, done) {
      // find a user
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // update to latest google profile
        user.googleProfile = profile.photos[0].value;
        // Include the returnTo URL in the user object
        user.returnTo = request.session && request.session.returnTo;
        await user.save();
        // if found set this user as req.user
        return done(null, user);
      }

      const appData = await App.find({});
      appData[0].totalUsers += 1;
      await appData[0].save();

      // if not found, create the user and set it as req.user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        password: crypto.randomBytes(20).toString("hex"),
        avatar: profile.photos[0].value,
        platformRank: appData[0].totalUsers,
      });

      if (!user) {
        return done(null, false);
      }
      // Include the returnTo URL in the user object
      user.returnTo = request.session.returnTo;
      return done(null, user);
    }
  )
);

module.exports = passport;
