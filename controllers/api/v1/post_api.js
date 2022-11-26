const Post = require('../../../models/post');
const Comment = require('../../../models/comment');



module.exports.index = async function(request, response) {
    
    let posts = await Post.find({})
    .sort('-createdAt')
    .populate('user')
    .populate({
        path: 'comments',
        populate: {
            path: 'user'
        }
    });

        
    return response.json(200, {
        message: "List of posts",
        posts: posts
    });
}


module.exports.destroy = async function(request, response) {
    try {
        let post = await Post.findById(request.params.id);
        if (post.user == request.user.id) {
            post.remove();

            await Comment.deleteMany({
                post: request.params.id
            });

            return response.json(200, {
                message: 'Post and associated comments deleted successfully!'
            });
        } else {
            return response.json(401, {
                message: 'You cannot delete this post!'
            })
        }
    } catch(error) {
        console.log("Error ", error);
        return response.json(500, {
            message: "Internal Server Error"
        });

    }
}