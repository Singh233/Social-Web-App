/* eslint-disable no-plusplus */
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Joi = require("joi");

const User = require("../../../models/user");
const Post = require("../../../models/post");
const Friendships = require("../../../models/friendship");
const env = require("../../../config/environment");
const ChatRoom = require("../../../models/chatRoom");
const { uploadImage, deleteFile } = require("../../../helper/googleCloudStore");

const CLIENT_ID = env.google_clientID;
const client = new OAuth2Client(CLIENT_ID);

const fieldsValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string(),
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

module.exports.createSession = async function (request, response) {
  try {
    // validate the fields
    const { value, error } = fieldsValidator.validate(request.body);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const user = await User.findOne({ email: request.body.email }).select(
      "+password"
    );

    if (!user || user.password !== request.body.password) {
      return handleResponse(
        response,
        422,
        "Invalid username or password",
        {},
        false
      );
    }

    // remove the password from the user object
    user.password = undefined;

    // expires in 11 days
    const expiresIn = 11 * 24 * 60 * 60 * 1000;

    return handleResponse(
      response,
      200,
      "Sign in successfull, here is your token, please keep it safe!",
      {
        token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn }), //
        user: user,
      },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// profile
module.exports.profile = async function (request, response) {
  try {
    // validate the request params
    const { value, error } = Joi.object({
      id: Joi.string().required().min(1).max(100),
    }).validate(request.params);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const user = await User.findById(request.params.id);
    const posts = await Post.find({ user: user._id })
      .limit(5)
      .sort("-createdAt");
    const savedPosts = [];
    // check if the user is same as the logged in user
    if (request.user.id === user.id) {
      await Promise.all(
        user.savedPosts.map(async (savedPost) => {
          const post = await Post.findById(savedPost);
          if (post) {
            savedPosts.push(post);
          }
        })
      );
    }

    const followers = await Friendships.find({ to_user: user._id }).populate(
      "from_user"
    );

    const following = await Friendships.find({
      from_user: user._id,
    }).populate({
      path: "to_user",
    });

    user.posts = posts;
    user.followers = followers;
    user.following = following;
    user.savedPosts = savedPosts;

    return handleResponse(response, 200, "User profile", { user }, true);
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// Create user
module.exports.create = async function (request, response) {
  try {
    // validate the fields
    const { value, error } = fieldsValidator.validate(request.body);

    if (error) {
      return handleResponse(response, 422, "Invalid fields", { error }, false);
    }

    const user = await User.findOne({ email: request.body.email });

    if (!user) {
      const newUser = await User.create(request.body);

      // expires in 11 days
      const expiresIn = 11 * 24 * 60 * 60 * 1000;

      return handleResponse(
        response,
        200,
        "Sign up successfull",
        {
          token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn }), //
          user: newUser,
        },
        true
      );
    }

    return handleResponse(response, 422, "User already exists", {}, false);
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

module.exports.createGoogleSession = async function (request, response) {
  try {
    // validate headers
    if (typeof request.headers.authorization === "undefined") {
      return handleResponse(response, 422, "Invalid fields", {}, false);
    }

    const token = request.headers.authorization.split(" ")[1];
    if (token == null) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { name, email } = payload;

    let user = await User.findOne({ email: email });

    // if user not found, create a new user
    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        password: crypto.randomBytes(20).toString("hex"),
      });
    }

    // expires in 11 days
    const expiresIn = 11 * 24 * 60 * 60 * 1000;

    return handleResponse(
      response,
      200,
      "Sign in successfull, here is your token, please keep it safe!",
      {
        token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn }), //
        user: user,
      },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// fetch user friends
module.exports.fetchUserFriends = async function (request, response) {
  try {
    const user = await User.findById(request.user.id);

    // find all the friendships where the user is the from_user and populate the posts, followers and following of the to_user
    const friendships = await Friendships.find({
      from_user: user._id,
    }).populate({
      path: "to_user",
      populate: {
        path: "posts followers following",
      },
    });

    const friendsArray = [];

    const compareByCreatedAt = (a, b) => {
      // Convert createdAt strings to Date objects
      const timeA = a.chatRoom.lastMessage.timestamp
        ? a.chatRoom.lastMessage.timestamp
        : `2000-05-11T18:05:57.632Z`;
      const timeB = b.chatRoom.lastMessage.timestamp
        ? b.chatRoom.lastMessage.timestamp
        : `2000-05-11T18:05:57.632Z`;

      const dateA = new Date(timeA);
      const dateB = new Date(timeB);

      // Compare the dates
      if (dateA > dateB) {
        return -1;
      }
      if (dateA < dateB) {
        return 1;
      }
      return 0;
    };

    await Promise.all(
      friendships.map(async (friend) => {
        friendsArray.push({
          ...friend.to_user._doc,
          status: friend.status,
          chatRoomId: friend.chat_room._id,
          chatRoom: await ChatRoom.findById(friend.chat_room),
        });
      })
    );

    friendsArray.sort(compareByCreatedAt);

    return handleResponse(
      response,
      200,
      "User friends",
      {
        friends: friendsArray,
      },
      true
    );
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// controller for search users
module.exports.search = async function (request, response) {
  // validate the query params
  const { value, error } = Joi.object({
    search: Joi.string().required().min(1).max(100),
  }).validate(request.query);

  if (error) {
    return handleResponse(response, 422, "Invalid fields", { error }, false);
  }

  const { search } = value;
  const regex = new RegExp(search, "i"); // i is for case insensitive search

  const users = await User.find({ name: regex });

  return handleResponse(response, 200, "Users found", { users: users }, true);
};

// a controller for updating user details (name, avatar)
module.exports.update = async function (request, response) {
  try {
    if (!request.user) {
      return handleResponse(response, 401, "Unauthorized", {}, false);
    }
    // validate the fields
    const { value, error } = Joi.object({
      name: Joi.string().min(1).max(100).required(),
    }).validate(request.body);

    if (error) {
      return handleResponse(
        response,
        422,
        error.details[0].message,
        { error },
        false
      );
    }
    const {
      file,
      body: { name: newName },
      user: { id: userId },
    } = request;
    const user = await User.findById(userId);

    user.name = newName;

    let imageUrl = null;
    if (file) {
      try {
        imageUrl = await uploadImage("sanam_users_avatar", file);
        // this is saving the path of the uploaded file into the field in the user
        user.avatar = imageUrl;
        // check and delete the previous avatar of user if it is not the same as the google profile
        if (
          user.avatar &&
          user.googleProfile &&
          user.avatar !== user.googleProfile
        ) {
          await deleteFile("sanam_users_avatar", user.avatar);
        }
      } catch (uploadError) {
        // return nothing if the image upload fails
      }
    }

    try {
      await user.save();
    } catch (dbError) {
      return handleResponse(response, 500, "Failed to update user", {}, false);
    }

    return handleResponse(response, 200, "User updated", { user }, true);
  } catch (error) {
    return handleResponse(response, 500, "Internal server error", {}, false);
  }
};

// controller for syncing google user profile
module.exports.syncGoogleProfile = async function (req, res) {
  try {
    const { user } = req;
    if (!user || !user.googleProfile) {
      return handleResponse(res, 401, "Unauthorized", {}, false);
    }

    // update avatar with google profile
    user.avatar = user.googleProfile;
    await user.save();

    return handleResponse(res, 200, "Profile synced", { user }, true);
  } catch (error) {
    return handleResponse(res, 500, "Internal server error!", { error }, false);
  }
};
