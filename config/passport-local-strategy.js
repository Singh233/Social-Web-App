const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// Authentication using passport
passport.use(new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true
    }, function (request, email, password, done) {
        // find a user and establish the identity
        User.findOne({email: email}, function(error, user) {
            if (error) {
                console.log('Error in finding user --> Passport', error);
                request.flash('error', err);
                return done(error);
            }

            if (!user || user.password != password) {
                console.log('Invalid Username/Password');
                request.flash('error', 'Invalid Username/Password');
                return done(null, false);
            }

            console.log('User found')
            return done(null, user);
        })
    }


));


// Serializing the user to decide which key is to be kept in the cookies

passport.serializeUser(function(user, done) {
    done(null, user.id);
});



// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done) {
    User.findById(id, function(error, user) {
        if (error) {
            console.log("Error in finding user --> Passport");
            return done(error);
        }

        return done(null, user);
    })
});


passport.checkAuthentication = function(request, response, next) {
    // if the user is signed in, then pass on the request to the next function(controlelr's action)
    if (request.isAuthenticated()) {
        return next();
    }
    console.log('User is not signed in');

    // if the user is not signed in
    return response.redirect('/users/sign-in-up');
}

passport.setAuthenticatedUser = function(request, response, next) {
    if (request.isAuthenticated()) {
        // request.user contains the current signed in user form the session cookie and we are just sending
        //this to the locals for the views 
        response.locals.user = request.user;
    }
    next();
}


module.exports = passport;