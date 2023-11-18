/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
const Joi = require("joi");

const { v4: uuidv4 } = require("uuid");
const Post = require("../models/post");
const queue = require("../config/kue");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");
const {
  uploadImage,
  generateThumbnail,
  deleteFile,
  uploadVideo,
  deleteFiles,
} = require("../helper/googleCloudStore");
const videoEncoderWorker = require("../workers/video_encoding_worker");
const Video = require("../models/video");

const generateUniquePrefix = () => {
  const timestamp = Date.now();
  const randomSuffix = uuidv4().split("-")[0]; // Extract a portion of the UUID
  const uniquePrefix = `${timestamp}-${randomSuffix}`;
  return uniquePrefix;
};

const imgUploadPost = async (request, response, file) => {
  let imageUrl = null;
  try {
    imageUrl = await uploadImage("users_posts_bucket", file);
  } catch (error) {
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
  } catch (error) {
    return response.status(401).json({
      data: {},
      success: false,
      message: "Error in uploading file!",
    });
  }

  // this is saving the path of the uploaded file into the field in the user
  const newPost = await Post.create({
    caption: request.body.caption,
    user: request.user._id,
    imgPath: imageUrl,
    thumbnail: thumbnailUrl,
    isImg: true,
  });

  // populate the user of newPost
  await newPost.populate("user");

  return newPost;
};

const videoUploadPost = async (request, response, file) => {
  let videoUrl = null;
  const uniquePrefix = generateUniquePrefix(); // Generate unique prefix
  const fileName = `${uniquePrefix}-${file.originalname.replace(/ /g, "_")}`; // Append prefix to file name
  try {
    // Upload the original video to GCS
    videoUrl = await uploadVideo("users_videos_bucket", file, fileName); // Implement uploadVideo function to upload the video to GCS.
  } catch (error) {
    console.log(error);
    return response.status(401).json({
      data: {},
      success: false,
      message: "Error in uploading video!",
    });
  }

  // Create a new Post document
  const newPost = await Post.create({
    isImg: false,
    thumbnail: "",
    video: null,
    caption: request.body.caption,
    user: request.user._id,
    comments: [],
    likes: [],
    savedBy: [],
  });

  // Populate the user field of the newPost
  await newPost.populate("user");

  const data = {
    videoUrl,
    uniquePrefix,
    userId: request.user.id,
    post: newPost,
    reqBody: request.body,
  };

  // parallel job to
  queue.create("videoEncoders", data).save(function (error) {
    if (error) {
      console.log(error);
    }
  });

  return newPost;
};

// eslint-disable-next-line consistent-return
module.exports.createPost = async function (request, response) {
  try {
    if (request.user.id !== request.params.id) {
      return response.status(401).send("Unauthorized");
    }
    const { file } = request;

    if (!file) {
      return response.status(401).json({
        data: {},
        success: false,
        message: "File not found!",
      });
    }
    let newPost = null;

    if (file.mimetype === "video/mp4" || file.mimetype === "video/quicktime") {
      newPost = await videoUploadPost(request, response, file);
    } else {
      newPost = await imgUploadPost(request, response, file);
    }

    if (request.xhr) {
      // the request is an AJAX request return the response in JSON format
      return response.status(200).json({
        data: {
          post: newPost,
          success: "Post created successfully!",
        },
        success: true,
        message: "Post created!",
      });
    }

    request.flash("success", "Post published!");
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    request.flash("error", "Error creating post");
    return response.redirect("back");
  }
};

module.exports.destroy = async function (request, response) {
  try {
    const post = await Post.findByIdAndRemove(request.params.id);
    const user = await User.findById(request.user.id);
    // remove post id from the savedPosts array
    const newSavedPosts = user.savedPosts.filter(
      (postId) => postId.toString() !== request.params.id
    );
    user.savedPosts = newSavedPosts;
    await user.save();

    // delete the associated likes for the post and all its comments likes too
    await Like.deleteMany({ likeable: post, onModel: "Post" });
    await Like.deleteMany({ _id: { $in: post.comments } });
    await Comment.deleteMany({
      post: request.params.id,
    });

    // delete the file from cloud storage
    if (post.imgPath) {
      await deleteFile("users_posts_bucket", post.imgPath, false);
    }

    // delete the thumbnail from cloud storage
    if (post.thumbnail) {
      await deleteFile("users_posts_bucket", post.thumbnail, true);
    }

    if (!post.isImg) {
      const video = await Video.findByIdAndRemove(post.video);
      await Promise.all(
        video.qualities.map(async (quality) => {
          await deleteFiles("users_videos_bucket", quality.videoPath);
        })
      );
    }

    return response.status(200).json({
      data: {
        post_id: request.params.id,
        success: "Post deleted successfully!",
      },
      message: "Post deleted!",
    });
  } catch (error) {
    console.log(error);
    return response.status(401).send("Unauthorized");
  }
};

// save post
module.exports.savePost = async function (request, response) {
  try {
    const { user } = request;

    // add the post id to the user's saved posts array
    user.savedPosts.push(request.params.id);
    user.save();

    // add the user id to the post's saved by array
    const post = await Post.findById(request.params.id);
    post.savedBy.push(user._id);
    post.save();

    return response.status(200).json({
      data: {
        success: "Post saved successfully!",
      },
      message: "Post saved!",
    });
  } catch (error) {
    request.flash("error", "Unauthorized");
    return response.status(401).send("Unauthorized");
  }
};

// unsave post
module.exports.unsavePost = async function (request, response) {
  try {
    const { user } = request;

    // remove the post id from the user's saved posts array
    user.savedPosts.pull(request.params.id);
    user.save();

    // remove the user id from the post's saved by array
    const post = await Post.findById(request.params.id);
    post.savedBy.pull(user._id);
    post.save();

    return response.status(200).json({
      data: {
        success: "Post unsaved successfully!",
      },
      message: "Post unsaved!",
    });
  } catch (error) {
    request.flash("error", "Unauthorized");
    return response.status(401).send("Unauthorized");
  }
};

// View post page
module.exports.viewSinglePost = async function (request, response) {
  try {
    // verify params
    const { value, error } = Joi.object({
      postId: Joi.string().required(),
    }).validate(request.params);

    if (error) {
      request.flash("error", "Invalid request!");
      return response.redirect("back");
    }

    let isSaved = false;
    if (request.user) {
      request.user.savedPosts.forEach((post) => {
        if (post._id.toString() === value.postId) {
          isSaved = true;
        }
      });
    }

    const post = await Post.findById(value.postId)
      .populate("user likes video")
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
    return response.render("post.ejs", {
      post,
      isSaved,
      title: "Post",
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "Internal server error");
    return response.redirect("back");
  }
};
