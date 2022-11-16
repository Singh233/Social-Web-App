const Post = require('../models/post');


module.exports.createPost = function(request, response) {
    Post.create({
        content: request.body.content,
        user: request.user._id
    }, function(error, post) {
        if (error) {
            console.log("error in creating post");
            return;
        }
        return response.redirect('back');
    })
}