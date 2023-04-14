const Comment = require('../../../models/comment');
const Post = require('../../../models/post');
const commentsMailer = require('../../../mailers/comments_mailer');
const queue = require('../../../config/kue');
const commentEmailWorker = require('../../../workers/comment_email_worker');
const Like = require('../../../models/like');


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

            
            return response.status(200).json({
                data: {
                    comment: comment,
                    success: 'Comment created successfully!'
                },
                message: "Comment created!",
                post_id: post.id,
                success: true,
            })
            
        }
    } catch(error) {
        console.log('Error ', error);
        return response.status(500).json({
            message: 'Internal Server Error',
            success: false
        });
    }
    

    
}

module.exports.destroy = async function(request, response) {
    try {
        let comment = await Comment.findById(request.params.id);
        if (comment.user == request.user.id) {
            let postId = comment.post;
            comment.remove();
            console.log('postid', postId)

            await Post.findByIdAndUpdate(postId, {
                $pull: {comments: request.params.id}
            });

            //destroy the associated likes for this comment
            await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});

            console.log('success delete comment')
            return response.status(200).json({
                data: {
                    comment: comment,
                    success: 'Comment deleted successfully!'
                },
                message: "Comment deleted!",
                comment_id: comment.id,
                success: true,
            })


        } else {
            return response.status(401).json({
                message: 'You cannot delete this comment!',
                success: false
            });
        }
        
    } catch(error) {
        console.log('Error ', error);
        return response.status(500).json({
            message: 'Internal Server Error',
            success: false
            });
    }
    
}