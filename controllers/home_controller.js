/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
const moment = require("moment");
const { v4: uuidV4 } = require("uuid");

const Post = require("../models/post");
const User = require("../models/user");
const Friendships = require("../models/friendship");
const env = require("../config/environment");
const ChatRoom = require("../models/chatRoom");
const App = require("../models/app");

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
      .limit(5)
      .populate("user")
      .populate("video")
      .populate("likes")
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

    const users = await User.find({});
    let followingCount = 0;

    const friends = await Friendships.find({
      from_user: request.user._id,
    }).populate("to_user");

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
      friends.map(async (friend) => {
        followingCount =
          friend.status === "accepted" ? followingCount + 1 : followingCount;
        friendsArray.push({
          ...friend.to_user._doc,
          status: friend.status,
          chatRoomId: friend.chat_room._id,
          chatRoom: await ChatRoom.findById(friend.chat_room),
        });
      })
    );

    friendsArray.sort(compareByCreatedAt);

    return response.render("home.ejs", {
      title: "Home",
      posts: posts,
      all_users: users,
      friends: friendsArray,
      followingCount: followingCount,
      websocket_host: env.websocket_host,
      moment: moment,
      roomId: "sample-id",
    });
  } catch (error) {
    request.flash("error", "Internal Server Error");
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
    request.flash("error", "Internal Server Error");
    return response.redirect("back");
  }
};

module.exports.upload = function (request, response) {
  return response.render("_sm_post_upload.ejs", {
    title: "Upload",
  });
};
