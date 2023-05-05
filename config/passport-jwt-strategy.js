const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

const env = require("./environment");
const User = require("../models/user");

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt_secret,
};

passport.use(
  new JWTStrategy(opts, async function (jwtPayLoad, done) {
    const user = await User.findById(jwtPayLoad._id);

    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  })
);

module.exports = passport;
