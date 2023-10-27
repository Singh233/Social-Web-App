/* eslint-disable no-undef */
const Comment = require("../models/comment");
const Post = require("../models/post");
const queue = require("../config/kue");
const Like = require("../models/like");
const commentEmailWorker = require("../workers/comment_email_worker");

module.exports.create = async function (request, response) {
  try {
    const post = await Post.findById(request.body.postId);
    if (!post) {
      request.flash("error", "Post not found");
      return response.redirect("back");
    }
    let comment = await Comment.create({
      content: request.body.content,
      user: request.user._id,
      post: request.body.postId,
    });

    post.comments.push(comment);
    post.save();
    comment = await comment.populate("user", "name email avatar comments");

    // parallel job to send email for comment creation to the comment creator
    // queue.create("emails", comment).save(function (error) {
    //   if (error) {
    //     request.flash("error", "Error in creating a queue");
    //   }
    // });

    // if the request is AJAX request then return the JSON response
    if (request.xhr) {
      return response.status(200).json({
        data: {
          comment: comment,
          success: "Comment created successfully!",
        },
        message: "Comment created!",
        post_id: post.id,
      });
    }

    // else redirect back
    request.flash("success", "Comment added!");
    return response.redirect("back");
  } catch (error) {
    request.flash("error", "Internal Server Error");
    return response.redirect("back");
  }
};

module.exports.destroy = async function (request, response) {
  try {
    const comment = await Comment.findByIdAndDelete(request.params.id);

    const postId = comment.post;

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: request.params.id },
    });

    // destroy the associated likes for this comment
    await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });

    // if the request is AJAX request then return the JSON response
    if (request.xhr) {
      return response.status(200).json({
        data: {
          comment: comment,
          success: "Comment deleted successfully!",
        },
        message: "Comment deleted!",
        comment_id: comment.id,
      });
    }

    request.flash("success", "Comment Deleted Successfully");
    return response.redirect("back");
  } catch (error) {
    request.flash("error", "Internal Server Error");
    return response.redirect("back");
  }
};
