const Comment = require('../models/comment');
const Post = require('../models/post');

module.exports.create = function(request, response) {
    Post.findById(request.body.postId, function(error, post) {
        if (post) {
            Comment.create({
                content: request.body.content,
                user: request.user._id,
                post: request.body.postId
            }, function(error, comment) {

                //handle error
                if (error) {
                    console.log("Error in creating comment");
                    return;
                }
                // add comment to post
                post.comments.push(comment);
                post.save();

                return response.redirect('back');
            });
        }
    })
    
}