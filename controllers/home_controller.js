const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

module.exports.home = function(request, response) {
    // Post.find({user: request.user._id}, function(error, post) {
    //     if (error) {
    //         console.log("Error finding user");
    //         return;
    //     }

    //     return response.render('home.ejs', {
    //         title: "Home",
    //         posts: post
    //     });
    // });


    // populate the user of each post
    Post.find({})
    .populate('user')
    .populate({
        path: 'comments',
        populate: {
            path: 'user'
        }
    })
    .exec(function(error, posts) {
        User.find({}, function(error, users) {
            return response.render('home.ejs', {
                title: "Home",
                posts: posts, 
                all_users: users
            });
        })
        
    })
}