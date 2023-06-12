const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const Post = require("../../../models/post");
const Comment = require("../../../models/comment");
const Like = require("../../../models/like");
const { generateThumbnail, uploadImage, deleteFile } = require("../../../helper/imageUpload");

const fieldsValidator = Joi.object({
  content: Joi.string().required(),
});

// helper function to handle the response
const handleResponse = (res, status, message, data, success) => {
  const response = {
    message,
    data,
    success,
  };
  return res.status(status).json(response);
};

module.exports.index = async function (request, response) {
  const posts = await Post.find({})
    .limit(5)
    .sort("-createdAt")
    .populate("user")
    .populate("likes")
    .populate({
      path: "comments",
      populate: {
        path: "user likes",
      },
    });

  return handleResponse(response, 200, "All posts", { posts }, true);
};

// eslint-disable-next-line consistent-return
module.exports.createPost = async function (request, response) {
  try {
    const { user } = request;
    if (!user) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }
    // validate the fields
    const { value, error } = fieldsValidator.validate(request.body);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const { file } = request;

    if (!file) {
      return response.status(401).json({
        data: {},
        success: false,
        message: "File not found!",
      });
    }

    let imageUrl = null;
    try {
      imageUrl = await uploadImage("users_posts_bucket", file);
    } catch (err) {
      return response.status(401).json({
        data: {},
        success: false,
        message: "Error in uploading file!",
      });
    }

    // generate thumbnail
    let thumbnailUrl = null;

    try {
      thumbnailUrl = await generateThumbnail(
        "users_posts_bucket",
        file,
        imageUrl
      );
    } catch (err) {
      return handleResponse(response, 400, "Error uploading file", {}, false);
    }

    // this is saving the path of the uploaded file into the field in the user
    const newPost = await Post.create({
      content: request.body.content,
      user: request.user._id,
      myfile: imageUrl,
      thumbnail: thumbnailUrl,
    });

    // populate the user of newPost
    await newPost.populate("user");

    return handleResponse(
      response,
      200,
      "Post created successfully",
      { post: newPost },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

module.exports.destroy = async function (request, response) {
  try {
    // validate the request params
    const { value, error } = Joi.object({
      id: Joi.string().required().min(1).max(100),
    }).validate(request.params);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const { user } = request;
    // check if the user exists
    if (!user) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }

    const post = await Post.findById(request.params.id);
    if (post.user._id.toString() !== user.id) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }

    // delete the post
    post.remove();

    // delete the associated likes for the post and all its comments' likes
    await Like.deleteMany({ likeable: post, onModel: "Post" });
    await Like.deleteMany({ _id: { $in: post.comments } });
    await Comment.deleteMany({ post: request.params.id });

    // delete the file from cloud storage
    if (post.myfile) {
      await deleteFile("users_posts_bucket", post.myfile, false);
    }

    // delete the thumbnail from cloud storage
    if (post.thumbnail) {
      await deleteFile("users_posts_bucket", post.thumbnail, true);
    }

    return handleResponse(
      response,
      200,
      "Post deleted successfully",
      { post },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// save post
module.exports.savePost = async function (request, response) {
  try {
    // validate the request params
    const { error } = Joi.object({
      id: Joi.string().required().min(1).max(100),
    }).validate(request.params);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const { user } = request;

    // add the post id to the user's saved posts array
    user.savedPosts.push(request.params.id);
    user.save();

    // add the user id to the post's saved by array
    const post = await Post.findById(request.params.id);
    post.savedBy.push(user._id);
    post.save();

    return handleResponse(
      response,
      200,
      "Post saved successfully",
      { post },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// unsave post
module.exports.unsavePost = async function (request, response) {
  try {
    // validate the request params
    const { error } = Joi.object({
      id: Joi.string().required().min(1).max(100),
    }).validate(request.params);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const { user } = request;

    // remove the post id from the user's saved posts array
    user.savedPosts.pull(request.params.id);
    user.save();

    // remove the user id from the post's saved by array
    const post = await Post.findById(request.params.id);
    post.savedBy.pull(user._id);
    post.save();

    return handleResponse(
      response,
      200,
      "Post unsaved successfully",
      { post },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// get posts
module.exports.getPosts = async (request, response) => {
  try {
    // verify query parameters
    const { value, error } = Joi.object({
      offset: Joi.string().required(),
      limit: Joi.string().required(),
    }).validate(request.query);

    if (error) {
      return handleResponse(response, 404, "Invalid fields!", { error }, false);
    }

    const { offset, limit } = value;

    const posts = await Post.find({})
      .sort("-createdAt")
      .skip(offset)
      .limit(limit)
      .populate("user likes")
      .populate({
        path: "comments",
        options: {
          sort: {
            createdAt: -1,
          },
        },
        populate: {
          path: "user likes",
        },
      });

    return handleResponse(response, 200, "All posts", { posts }, true);
  } catch (error) {
    return handleResponse(response, 500, "Server error!", { error }, false);
  }
};
