const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const Friendships = require('../models/friendship');
const Post = require('../models/post');


module.exports.profile = function(request, response) {
    User.findById(request.params.id, function(error, user) {
        if (error) {
            console.log("Error in finding profile");
            flash('error', 'Error in finding profile');
            return response.redirect('back');
        }
        
        Friendships.find({to_user: user._id}, function(error, friends) {
            //console.log('Inside friendships', friends);
            // for (let friend of friends) {
            //     let currUser = User.find({_id: friend.to_user});
            //     friendsArray.push(currUser);
            // }
            if (error) {
                console.log("Error in finding friendships");
                flash('error', 'Error in finding friendships');
                return response.redirect('back');
            }
            console.log(friends);
            Post.find({user: user._id}, function (error, posts) {
                if (error ) {
                    console.log("error in finding user posts");
                    return;
                }

                // find following
                Friendships.find({from_user: user._id}, function(error, following) {
                    if (error) {
                        console.log("Error in finding following");
                        return;
                    }
                    

                    return response.render('user_profile.ejs', {
                        title: "Profile",
                        profile_user: user,
                        friends: friends,
                        user_posts: posts,
                        following: following,
                        followers: friends
                    });
                    
                })
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
            
    
            return response.render('user_edit_profile.ejs', {
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
            let user = await User.findById(request.params.id);

            User.uploadedAvatar(request, response, function(error) {
                if (error) {
                    console.log('****** Multer Error: ', error);

                    request.flash('error', 'Error in uploading file');
                    return response.redirect('back');
                }
                user.name = request.body.name;
                user.email = request.body.email;
                


                if (request.file) {

                    // if (user.avatar) {
                    //     fs.unlinkSync(path.join(__dirname, '..', user.avatar));
                    // }
                    // this is saving the path of the uploaded file into the field in the user
                    user.avatar = User.avatarPath + '/' + request.file.filename;
                }
                user.save();
                request.flash('success', 'Successfully updated profile!');

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
        return response.redirect('/');
    }
    return response.render('user_sign_up.ejs', {
        title: "SanamSocial | Sign Up"
    })
}


// render sign in page
module.exports.signIn = function(request, response) {
    if (request.isAuthenticated()) {
        return response.redirect('/home');
    }
    return response.render('home.ejs', {
        title: "SanamSocial | Sign In"
    })
}

// get the sign up data
module.exports.create = async function(request, response) {
    if (request.body.password != request.body.confirm_password) {
        request.flash('error', 'Passwords do not match!');
        return response.redirect('back');
    }

    User.findOne({email: request.body.email}, function(error, user) {
        if (error) {
            console.log("Error in finding user in singing up");
            // flash message
            request.flash('error', 'Something went wrong!');
            return;
        }

        if (!user) {
            User.create(request.body, function(error, user) {
                if (error) {
                    console.log('Error in creating user while singing up');
                    // flash message
                    request.flash('error', 'Something went wrong!');
                    return;
                }
                // flash message
                request.flash('success', 'Account created successfully!');
                return response.redirect('/');
            })
        } else {
            // flash message
            request.flash('error', 'User already exists!');
            return response.redirect('back');
        }
    })
}


// get the sign in data

module.exports.createSession = function(request, response) {
    request.flash('success', 'Logged in Successfully');
    

    return response.redirect('/home');
}


module.exports.destroySession = function(request, response) {
    request.logout(function(error) {
        if (error) {
            console.log("error signing out");
            return;
        }
    });
    
    request.flash('success', 'You have logged out!');

    return response.redirect('/users/sign-in-up');
}


// controller for search users
module.exports.search = function(request, response) {
    let search = request.query.search;
    let regex = new RegExp(search, 'i'); // i is for case insensitive search 
    // console.log(regex)

    User.find({name: regex}, function(error, users) {
        if (error) {
            console.log("Error in finding users");
            return;
        }

        return response.status(200).json({
            message: "List of users",
            users: users,
            success: true
        })

    })
}