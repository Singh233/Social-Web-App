const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const env = require('./environment');

passport.use(
    new GoogleTokenStrategy(
        {
            clientID: env.google_clientID,
            clientSecret: env.google_clientSecret,
        },
        (accessToken, refreshToken, profile, done) => {
            // Verify the access token with Google and create a session for the user
            // You can also perform additional database operations here, such as creating a new user account
            return done(null, profile);
        }
    )
);
