const User = require('../models/user');

module.exports.profile = function(request, response) {
    User.findById(request.params.id, function(error, user) {
        return response.render('user_profile.ejs', {
            title: "Profile",
            profile_user: user
        });
    })
    
}

// render sign up page
module.exports.signUp = function(request, response) {
    if (request.isAuthenticated()) {
        return response.redirect('/users/profile');
    }
    return response.render('user_sign_up.ejs', {
        title: "Codeial | Sign Up"
    })
}


// render sign in page
module.exports.signIn = function(request, response) {
    if (request.isAuthenticated()) {
        return response.redirect('/users/profile');
    }
    return response.render('user_sign_in.ejs', {
        title: "Codeial | Sign In"
    })
}

// get the sign up data
module.exports.create = function(request, response) {
    if (request.body.password != request.body.confirm_password) {
        return response.redirect('back');
    }

    User.findOne({email: request.body.email}, function(error, user) {
        if (error) {
            console.log("Error in finding user in singing up");
            return;
        }

        if (!user) {
            User.create(request.body, function(error, user) {
                if (error) {
                    console.log('Error in creating user while singing up');
                    return;
                }
                return response.redirect('/users/sign-in');
            })
        } else {
            return response.redirect('back');
        }
    })
}


// get the sign in data

module.exports.createSession = function(request, response) {
    
    return response.redirect('/');
}


module.exports.destroySession = function(request, response) {
    request.logout(function(error) {
        if (error) {
            console.log("error signing out");
            return;
        }
        return response.redirect('/');
    });
    return response.redirect('/');
}