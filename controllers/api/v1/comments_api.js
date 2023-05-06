const Joi = require("joi");

const Comment = require("../../../models/comment");
const Post = require("../../../models/post");
const queue = require("../../../config/kue");
const Like = require("../../../models/like");

const fieldsValidator = Joi.object({
  content: Joi.string(),
  postId: Joi.string().required(),
});

const handleResponse = (res, status, message, data, success) => {
  const response = {
    message,
    data,
    success,
  };
  return res.status(status).json(response);
};

module.exports.create = async function (request, response) {
  try {
    // validate the request body
    const { value, error } = fieldsValidator.validate(request.body);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const { postId, content } = value;

    const post = await Post.findById(postId);

    if (!post) {
      return handleResponse(
        response,
        404,
        "Post not found",
        { error: "Post not found" },
        false
      );
    }

    let comment = await Comment.create({
      content: content,
      user: request.user._id,
      post: postId,
    });

    post.comments.push(comment);
    post.save();
    comment = await comment.populate("user", "name email avatar comments");

    // for sending email to the user who commented on the post
    try {
      queue.create("emails", comment).save();
    } catch (exceptionError) {
      /* empty */
    }

    return handleResponse(
      response,
      200,
      "Comment created successfully!",
      {
        comment: comment,
        success: "Comment created successfully!",
        post_id: post.id,
      },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal Server Error", {}, false);
  }
};

module.exports.destroy = async function (request, response) {
  try {
    // validate the params
    const { id } = request.params;
    if (!id) {
      return handleResponse(response, 422, "Invalid fields", {}, false);
    }

    const comment = await Comment.findById(request.params.id);

    if (comment.user.toString() !== request.user.id) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }

    // delete the comment
    comment.remove();

    // find the post id of the comment
    const postId = comment.post;

    // pull the comment id from the post
    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: request.params.id },
    });

    // destroy the associated likes for this comment
    await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });

    return handleResponse(
      response,
      200,
      "Comment deleted successfully!",
      {
        comment_id: comment.id,
        post_id: postId,
      },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal Server Error", {}, false);
  }
};
