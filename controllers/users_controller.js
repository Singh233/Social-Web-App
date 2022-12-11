const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const Friendships = require('../models/friendship');
const Post = require('../models/post');


module.exports.profile = function(request, response) {
    User.findById(request.params.id, function(error, user) {
        if (error) {
            console.log("Error in finding profile");
            return;
        }

        let friendsArray = [];
        
        let friends = Friendships.find({to_user: user._id}, function(error, friends) {
            //console.log('Inside friendships', friends);
            // for (let friend of friends) {
            //     let currUser = User.find({_id: friend.to_user});
            //     friendsArray.push(currUser);
            // }
            if (error) {
                console.log("Error in finding friendships");
                return;
            }
            let posts = Post.find({user: user._id}, function (error, posts) {
                if (error ) {
                    console.log("error in finding user posts");
                    return;
                }

                console.log(posts);
    
                return response.render('_sm_profile_page.ejs', {
                    title: "Profile",
                    profile_user: user,
                    friends: friends,
                    user_posts: posts
                });
            })
            
        });
    })
}


module.exports.editProfile = function(request, response) {
    User.findById(request.params.id, function(error, user) {
        if (error) {
            console.log("Error in finding profile");
            return;
        }

        let friendsArray = [];
        
        let friends = Friendships.find({to_user: user._id}, function(error, friends) {
            //console.log('Inside friendships', friends);
            // for (let friend of friends) {
            //     let currUser = User.find({_id: friend.to_user});
            //     friendsArray.push(currUser);
            // }
            if (error) {
                console.log("Error in finding friendships");
                return;
            }
            
    
            return response.render('user_profile.ejs', {
                title: "Profile",
                profile_user: user,
                friends: friends,
            });
          
            
        });
    })
}

module.exports.update = async function(request, response) {
    if (request.user.id == request.params.id) {
        try {
            console.log(request.body);
            let user = await User.findById(request.params.id);
            console.log(user);
            console.log(request.params.id);
            User.uploadedAvatar(request, response, function(error) {
                if (error) {
                    console.log('****** Multer Error: ', error);
                }
                user.name = request.body.name;
                user.email = request.body.email;
                
                console.log(request.file);
                console.log(request.body);

                if (request.file) {

                    // if (user.avatar) {
                    //     fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    // }
                    // this is saving the path of the uploaded file into the field in the user
                    user.avatar = User.avatarPath + '/' + request.file.filename;
                }
                user.save();
                request.flash('success', 'Update successfully!');

                return response.redirect('back');
            })
        } catch (error) {
            console.log("Error ", error);
            request.flash('error', 'Something went wrong!');

            return response.status(401).send('Unauthorized');
        }
        
    } else {
        return response.response.status(401).send("Unauthorized");
    }


}

// render sign up page
module.exports.signUp = function(request, response) {
    if (request.isAuthenticated()) {
        return response.redirect('/users/profile');
    }
    return response.render('user_sign_up.ejs', {
        title: "SanamSocial | Sign Up"
    })
}


// render sign in page
module.exports.signIn = function(request, response) {
    if (request.isAuthenticated()) {
        return response.redirect('/users/profile');
    }
    return response.render('home.ejs', {
        title: "SanamSocial | Sign In"
    })
}

// get the sign up data
module.exports.create = async function(request, response) {
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
    request.flash('success', 'Logged in Successfully');
    

    return response.redirect('/');
}


module.exports.destroySession = function(request, response) {
    request.logout(function(error) {
        if (error) {
            console.log("error signing out");
            return;
        }
    });
    request.flash('success', 'You have logged out!');

    return response.redirect('/');
}