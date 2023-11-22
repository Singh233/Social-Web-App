const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

// Authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (request, email, password, done) {
      // find a user and establish the identity
      const user = await User.findOne({ email: email }).select("+password");

      if (!user || user.password !== password) {
        request.flash("error", "Invalid Username/Password");
        return done(null, false);
      }
      // Include the returnTo URL in the user object
      user.returnTo = request.session.returnTo;
      return done(null, user);
    }
  )
);

// Serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// deserializing the user from the key in the cookies
passport.deserializeUser(function (id, done) {
  User.findById(id, function (error, user) {
    if (error) {
      return done(error);
    }

    return done(null, user);
  });
});

passport.checkAuthentication = function (request, response, next) {
  // if the user is signed in, then pass on the request to the next function(controlelr's action)
  request.session.returnTo = request.originalUrl;

  if (request.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return response.redirect("/users/sign-in-up");
};

passport.setAuthenticatedUser = function (request, response, next) {
  if (request.isAuthenticated()) {
    // request.user contains the current signed in user form the session cookie and we are just sending
    // this to the locals for the views
    response.locals.user = request.user;
  }
  next();
};

module.exports = passport;
