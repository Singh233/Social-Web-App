/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
const moment = require("moment");

const Post = require("../models/post");
const User = require("../models/user");
const Friendships = require("../models/friendship");
const env = require("../config/environment");

module.exports.redirectToHome = function (request, response) {
  return response.redirect("/home");
};

module.exports.home = async function (request, response) {
  // populate user likes and comments of each post
  try {
    if (!request.user) {
      return response.redirect("/users/sign-in");
    }

    const posts = await Post.find({})
      .sort("-createdAt")
      .populate("user")
      .populate("likes")
      .populate({
        path: "comments",
        populate: {
          path: "user likes",
        },
      });

    const users = await User.find({});
    let followingCount = 0;

    const friends = await Friendships.find({
      from_user: request.user._id,
    }).populate("to_user");

    const friendsArray = [];

    for (const friend of friends) {
      followingCount =
        friend.status === "accepted" ? followingCount + 1 : followingCount;
      friendsArray.push({
        ...friend.to_user._doc,
        status: friend.status,
        chatRoomId: friend.chat_room,
      });
    }

    return response.render("home.ejs", {
      title: "Home",
      posts: posts,
      all_users: users,
      friends: friendsArray,
      followingCount: followingCount,
      websocket_host: env.websocket_host,
      moment: moment,
    });
  } catch (error) {
    flash("error", "Internal Server Error");
    return response.redirect("back");
  }
};

module.exports.search = async function (request, response) {
  try {
    const users = await User.find({});
    return response.render("search.ejs", {
      title: "Search",
      all_users: users,
    });
  } catch (error) {
    flash("error", "Internal Server Error");
    return response.redirect("back");
  }
};
