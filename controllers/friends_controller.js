const User = require("../models/user");
const Friendship = require("../models/friendship");
const ChatRoom = require("../models/chatRoom");

module.exports.add = async function (req, res) {
  try {
    const fromUser = await User.findById(req.query.from);
    const toUser = await User.findById(req.query.to);

    // check if the friendship already exists
    const findFromUserFriendship = await Friendship.findOne({
      from_user: fromUser,
      to_user: toUser,
    });

    if (findFromUserFriendship) {
      // update the status of the friendship
      findFromUserFriendship.status = "accepted";
      findFromUserFriendship.save();

      return res.status(200).json({
        message: "Request successful",
        success: true,
      });
    }

    // check if the friendship already exists
    const findToUserFriendship = await Friendship.findOne({
      from_user: toUser,
      to_user: fromUser,
    });

    if (findToUserFriendship) {
      // update the status of the friendship
      findToUserFriendship.status = "accepted";
      findToUserFriendship.save();

      return res.status(200).json({
        message: "Request successful",
        success: true,
      });
    }

    // if the friendship does not exist, create a new chat room
    const chatRoom = await ChatRoom.create({
      type: "private",
      users: [fromUser, toUser],
    });

    // create a new friendship for the from user
    const fromUserFriendship = await Friendship.create({
      from_user: fromUser,
      to_user: toUser,
      status: "accepted",
      chat_room: chatRoom,
    });

    // create a new friendship for the to user
    const toUserFriendship = await Friendship.create({
      from_user: toUser,
      to_user: fromUser,
      status: "pending",
      chat_room: chatRoom,
    });

    // push the friendship to the from user
    fromUser.friendships.push(fromUserFriendship);
    fromUser.save();

    // push the friendship to the to user
    toUser.friendships.push(toUserFriendship);
    toUser.save();

    return res.status(200).json({
      message: "Request successful",
      success: true,
    });
  } catch (error) {
    return res.send(500, {
      message: error,
      success: false,
    });
  }
};

module.exports.remove = async function (req, res) {
  try {
    const friendship = await Friendship.findOne({
      from_user: req.query.from,
      to_user: req.query.to,
    });

    // update the status of the friendship
    friendship.status = "deleted";
    friendship.save();

    return res.status(200).json({
      message: "Request successful",
      success: true,
    });
  } catch (error) {
    // flash message
    req.flash("error", "Error in unfollowing friend!");
    return res.send(500, {
      message: error,
      success: false,
    });
  }
};
