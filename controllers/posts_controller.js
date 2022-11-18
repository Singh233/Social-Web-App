const Post = require('../models/post');
const Comment = require('../models/comment');

module.exports.createPost = async function(request, response) {
    try {
        await Post.create({
            content: request.body.content,
            user: request.user._id
        });
        return response.redirect('back');
    } catch(error) {
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
            return response.redirect('back');
        } else {
            return response.redirect('back');
        }
    } catch(error) {
        console.log("Error ", error);
    }
    

}