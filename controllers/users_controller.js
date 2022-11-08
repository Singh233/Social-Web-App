const User = require('../models/user');

module.exports.profile = function(request, response) {
    if (request.cookies.user_id) {
        User.findById(request.cookies.user_id, function(error, user) {
            if (user) {
                return response.render('user_profile.ejs', {
                    user: user,
                    title: user.name + 'Profile'
                });
            }

            return response.redirect('/users/sign-in');
        });
    } else {
        return response.redirect('/users/sign-in');
    }
    
}

// render sign up page
module.exports.signUp = function(request, response) {
    return response.render('user_sign_up.ejs', {
        title: "Codeial | Sign Up"
    })
}


// render sign in page
module.exports.signIn = function(request, response) {
    return response.render('user_sign_in.ejs', {
        title: "Codeial | Sign In"
    })
}

// render sign in page
module.exports.signOut = function(request, response) {
    response.clearCookie('user_id');
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
    // Steps to authenticate
    //find the user
    User.findOne({email: request.body.email}, function(error, user) {
        if (error) {
            console.log("Error in finding user in singing in");
            return;
        }

        // handle user found

        if (user) {
            // handle password which don't match
            if (user.password != request.body.password) {
                return response.redirect('back');
            }
            // handle session creation
            response.cookie('user_id', user.id);
            return response.render('user_profile.ejs', {
                user: user,
                    title: user.name + 'Profile'
            });
        } else {
            // handle user not found
            return response.redirect('back');
        }
    })
    

    

    

}