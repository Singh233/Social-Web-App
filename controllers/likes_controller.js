const Like = require("../models/like");
const Comment = require("../models/comment");
const Post = require("../models/post");

module.exports.toggleLike = async function (request, response) {
  try {
    let likeable;
    let deleted = false;

    if (request.query.type === "Post") {
      likeable = await Post.findById(request.query.id).populate("likes");
    } else {
      likeable = await Comment.findById(request.query.id).populate("likes");
    }

    // check if a like already exists
    const exisitingLike = await Like.findOne({
      likeable: request.query.id,
      onModel: request.query.type,
      user: request.user._id,
    });

    // if a like already exists then delete it
    if (exisitingLike) {
      likeable.likes.pull(exisitingLike._id);
      likeable.save();
      await Like.findByIdAndDelete(exisitingLike._id);
      deleted = true;
    } else {
      // else make a new like
      const newLike = await Like.create({
        user: request.user._id,
        likeable: request.query.id,
        onModel: request.query.type,
      });

      likeable.likes.push(newLike._id);
      likeable.save();
    }

    return response.json(200, {
      message: "Request Successfull",
      data: {
        deleted: deleted,
      },
    });
  } catch (error) {
    request.flash("error", error);
    return response.json(500, {
      message: "Internal Server Error",
    });
  }
};
