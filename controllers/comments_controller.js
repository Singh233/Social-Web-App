const Comment = require('../models/comment');
const Post = require('../models/post');
const commentsMailer = require('../mailers/comments_mailer');
const queue = require('../config/kue');
const commentEmailWorker = require('../workers/comment_email_worker');
const Like = require('../models/like');


module.exports.create = async function(request, response) {
    try {
        let post = await Post.findById(request.body.postId);
        if (post) {
            let comment = await Comment.create({
                content: request.body.content,
                user: request.user._id,
                post: request.body.postId
            });

            post.comments.push(comment);
            post.save();
            comment = await comment.populate('user', 'name email avatar comments');

            // for mail
            // commentsMailer.newComment(comment);
            let job = queue.create('emails', comment).save(function(error) {
                if (error) {
                    console.log('Error in creating a queue');
                    return;
                }

                console.log('job enqueue', job.id);

            });

            if (request.xhr) {
                console.log(post.id);
                return response.status(200).json({
                    data: {
                        comment: comment,
                        success: 'Comment created successfully!'
                    },
                    message: "Comment created!",
                    post_id: post.id
                })
            }
            request.flash('success', 'Comment added!');
            return response.redirect('back');
        }
    } catch(error) {
        console.log('Error ', error);
        return;
    }
    

    
}

module.exports.destroy = async function(request, response) {
    try {
        let comment = await Comment.findById(request.params.id);
        if (comment.user == request.user.id) {
            let postId = comment.post;
            comment.remove();

            await Post.findByIdAndUpdate(postId, {
                $pull: {comments: request.params.id}
            });

            //destroy the associated likes for this comment
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});
            if (request.xhr) {
                return response.status(200).json({
                    data: {
                        comment: comment,
                        success: 'Comment deleted successfully!'
                    },
                    message: "Comment deleted!",
                    comment_id: comment.id
                })
            }
            request.flash('success', 'Comment Deleted Successfully');
            return response.redirect('back');


        } else {
            return response.redirect('back');
        }
        
    } catch(error) {
        console.log('Error ', error);
        return;
    }
    
}