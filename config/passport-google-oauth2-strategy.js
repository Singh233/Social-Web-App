const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const crypto = require('crypto');
const User = require('../models/user');


// tell passport to use a new strategy for google login
passport.use(new GoogleStrategy({
        clientID: '371901314984-tm13ulh161eelsvocrlne4rm8g6qn9sh.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:8000/users/auth/google/callback',
    },

    function(accessToken, refreshToken, profile, done) {

        //find a user
        User.findOne({email: profile.emails[0].value}).exec(function(error, user) {
            if (error) {
                console.log('Error in google strategy passport', error);
                return;
            }
            console.log(profile);
            if (user) {
                //if found set this user as req.user
                return done(null, user);
            }
            User.create({

                // if not found create the user and set it as req.user
                name: profile.displayName,
                email: profile.emails[0].value,
                password: crypto.randomBytes(20).toString('hex')
            }, function(error, user) {
                if (error) {
                    console.log("Error in creating user google auth", error);
                    return;
                }

                return done(null, user);
            })
        })
    }

));


module.exports = passport;