const Post = require('../models/post');
const User = require('../models/user');

module.exports.home = function(request, response) {
    Post.find({user: request.user._id}, function(error, post) {
        if (error) {
            console.log("Error finding user");
            return;
        }

        return response.render('home.ejs', {
            title: "Home",
            posts: post
        });
    });
}