const Post = require('../models/post');
const Comment = require('../models/comment');

module.exports.createPost = async function(request, response) {
    try {
        
        let post = await Post.create({
            content: request.body.content,
            user: request.user._id,
        });

        let posts = await Post.find({_id: post._id})
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            }
        });
    

        if (request.xhr) {
            return response.status(200).json({
                data: {
                    post: posts[0],
                    success: 'Post created successfully!'
                },
                message: "Post created!"
            })
        }
        request.flash('success', 'Post created Successfully');
        
        return response.redirect('back');
    } catch(error) {
        request.flash('error', error);
        console.log("error", error);
    }
    
}

module.exports.destroy = async function(request, response) {
    try {
        let post = await Post.findById(request.params.id);
        if (post.user == request.user.id) {
            post.remove();

            await Comment.deleteMany({
                post: request.params.id
            });
            if (request.xhr) {
                return response.status(200).json({
                    data: {
                        post_id: request.params.id,
                        success: 'Post deleted successfully!'
                    },
                    message: "Post deleted!"
                });
            }
            return response.redirect('back');
        } else {
            request.flash('error', error);
            return response.redirect('back');
        }
    } catch(error) {
        console.log("Error ", error);
        return response.status(401).send('Unauthorized');

    }
    

}