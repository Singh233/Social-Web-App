const Like = require('../../../models/like');
const Comment = require('../../../models/comment');
const Post = require('../../../models/post');

module.exports.toggleLike = async function(request, response) {

    try {
        // likes/toggle/?id=abcede&likeable_type=Post
        let likeable;
        let deleted = false;

        if (request.query.likeable_type == 'Post') {
            likeable = await Post.findById(request.query.likeable_id).populate('likes');
        } else {
            likeable = await Comment.findById(request.query.likeable_id).populate('likes');
        }
        // console.log(likeable);
        console.log(request.query.likeable_id);
        console.log(request.query.likeable_type);
        console.log(request.user._id);

        // check if a like already exists
        let exisitingLike = await Like.findOne({
            likeable: request.query.likeable_id,
            onModel: request.query.likeable_type,
            user: request.user._id
        });
        console.log(exisitingLike);
        // if a like already exists then delte it
        if (exisitingLike) {
            likeable.likes.pull(exisitingLike._id);
            likeable.save();
            exisitingLike.remove();
            deleted = true;
            console.log(deleted);
        } else {
            // else make a new like
            let newLike = await Like.create({
                user: request.user._id,
                likeable: request.query.likeable_id,
                onModel: request.query.likeable_type
            });

            likeable.likes.push(newLike._id);
            likeable.save();
        }

        return response.json(200, {
            message: "Request Successfull",
            success: true,
            data: {
                deleted: deleted
            }
        })
        
    } catch (error) {
        console.log("Error ", error);
        return response.json(500, {
            message: "Internal Server Error"
        })
    }

}