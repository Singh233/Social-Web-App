const Joi = require("joi");

const Like = require("../../../models/like");
const Comment = require("../../../models/comment");
const Post = require("../../../models/post");

const fieldsValidator = Joi.object({
  likeable_id: Joi.string().required(),
  likeable_type: Joi.string().required(),
});

const handleResponse = (res, status, message, data, success) => {
  const response = {
    message,
    data,
    success,
  };
  return res.status(status).json(response);
};

module.exports.toggleLike = async function (request, response) {
  try {
    // validate the request query
    const { value, error } = fieldsValidator.validate(request.query);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    let likeable = null;
    let deleted = false;

    if (value.likeable_type === "Post") {
      likeable = await Post.findById(value.likeable_id).populate("likes");
    } else {
      likeable = await Comment.findById(value.likeable_id).populate("likes");
    }

    // check if a like already exists
    const exisitingLike = await Like.findOne({
      likeable: value.likeable_id,
      onModel: value.likeable_type,
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
        likeable: value.likeable_id,
        onModel: value.likeable_type,
      });

      likeable.likes.push(newLike._id);
      likeable.save();
    }

    return handleResponse(
      response,
      200,
      "Request Successfull",
      { deleted },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal Server Error", {}, false);
  }
};
