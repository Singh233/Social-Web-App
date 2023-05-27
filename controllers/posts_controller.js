const fs = require("fs");
const path = require("path");

const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");

// eslint-disable-next-line consistent-return
module.exports.createPost = async function (request, response) {
  try {
    if (request.user.id !== request.params.id) {
      return response.status(401).send("Unauthorized");
    }

    Post.uploadedFile(request, response, async function (error) {
      if (error) {
        request.flash("error", "Error uploading file");
        return response.status(422).send("Error uploading file");
      }

      // this is saving the path of the uploaded file into the field in the user
      const newPost = await Post.create({
        content: request.body.content,
        user: request.user._id,
        myfile: `${Post.filePath}/${request.file.filename}`,
      });

      // populate the user of newPost
      await newPost.populate("user");

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
    });
  } catch (error) {
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

    // delete the file associated with the post
    if (post.myfile) {
      fs.unlinkSync(path.join(__dirname, "..", post.myfile));
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
