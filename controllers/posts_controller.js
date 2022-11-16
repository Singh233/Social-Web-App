const Post = require('../models/post');
const User = require('../models/user');


module.exports.posts = function(request, response) {
    return response.render('posts.ejs', {
        title: "Posts",
    });
    
}

module.exports.create = function(request, response) {
    User.findOne({})
    Post.create({
        content: request.body.content,
        user: request.user._id
    }, function(error, post) {
        if (error) {
            console.log("Error in creating a post");
            return;
        }
        return response.redirect('back');
    });
}