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

module.exports.destroy = function(request, response) {
    Comment.findById(request.params.id, function(error, comment) {
        if (comment.user == request.user.id) {
            let postId = comment.post;
            comment.remove();

            Post.findByIdAndUpdate(postId, {
                $pull: {comments: request.params.id}
            }, function(error, post) {
                if (error) {
                    console.log("error in pulling comment");
                    return;
                }
                return response.redirect('back');
            })


        } else {
            return response.redirect('back');
        }
    })
}