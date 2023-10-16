/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
const { v4: uuidv4 } = require("uuid");
const fsExtra = require("fs-extra");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");
const {
  uploadImage,
  generateThumbnail,
  deleteFile,
  uploadVideo,
} = require("../helper/googleCloudStore");
const transcodeVideoToQuality = require("../helper/videoEncoder");

const generateUniquePrefix = () => {
  const timestamp = Date.now();
  const randomSuffix = uuidv4().split("-")[0]; // Extract a portion of the UUID
  const uniquePrefix = `${timestamp}-${randomSuffix}`;
  return uniquePrefix;
};

const clearLocalFiles = (outputFileName) => {
  const directoryPath = `/Users/sanambirsingh/Documents/development/codeial/uploads/${outputFileName}`;
  // delete all the files
  fsExtra.remove(directoryPath).catch((err) => {
    console.error(`Error deleting directory: ${err}`);
  });
};

const imgUpload = async (request, response, file) => {
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

const videoUpload = async (request, response, file) => {
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

  // Define quality levels for transcoding
  const qualities = [
    { name: "high", resolution: "1280x720", bitrate: "2500k" },
    { name: "medium", resolution: "640x360", bitrate: "1000k" },
    { name: "low", resolution: "426x240", bitrate: "500k" },
  ];

  const transcodedVideos = [];
  // Transcode the video into different qualities
  await Promise.all(
    qualities.map(async (quality) => {
      try {
        const outputUrl = await transcodeVideoToQuality(
          "users_videos_bucket",
          uniquePrefix,
          quality,
          videoUrl
        ); // Implement transcodeVideoToQuality function to transcode the video.
        transcodedVideos.push({ quality: quality.name, videoPath: outputUrl });
        return transcodedVideos;
      } catch (error) {
        console.log(error);
        return response.status(401).json({
          data: {},
          success: false,
          message: "Error transcoding video!",
        });
      }
    })
  );
  await deleteFile("users_videos_bucket", videoUrl, false);
  const outputFileName = `transcoded_${uniquePrefix}`;
  clearLocalFiles(outputFileName);
  return null;

  // Create a new Post document with the video qualities
  // const newPost = await Post.create({
  //   caption: request.body.caption,
  //   user: request.user._id,
  //   videoPath: videoUrl,
  //   videoQualities: transcodedVideos,
  //   isVideo: true,
  // });

  // // Populate the user field of the newPost
  // await newPost.populate("user").execPopulate();

  // return newPost;
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
      newPost = await videoUpload(request, response, file);
    } else {
      newPost = await imgUpload(request, response, file);
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

    return response.status(200).json({
      data: {
        post_id: request.params.id,
        success: "Post deleted successfully!",
      },
      message: "Post deleted!",
    });
  } catch (error) {
    request.flash("error", "Unauthorized");
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
