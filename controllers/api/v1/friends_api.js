const Joi = require("joi");

const User = require("../../../models/user");
const Friendship = require("../../../models/friendship");
const ChatRoom = require("../../../models/chatRoom");

const fieldsValidator = Joi.object({
  from_user: Joi.string().required(),
  to_user: Joi.string().required(),
});

const handleResponse = (res, status, message, data, success) => {
  const response = {
    message,
    data,
    success,
  };
  return res.status(status).json(response);
};

module.exports.add = async function (req, res) {
  try {
    // validate the request query
    const { value, error } = fieldsValidator.validate(req.query);

    if (error) {
      return handleResponse(res, 422, "Invalid fields", { error }, false);
    }

    const fromUser = await User.findById(value.from_user);
    const toUser = await User.findById(value.to_user);

    // check if the friendship already exists
    const findFromUserFriendship = await Friendship.findOne({
      from_user: fromUser,
      to_user: toUser,
    });

    if (findFromUserFriendship) {
      // update the status of the friendship
      findFromUserFriendship.status = "accepted";
      await findFromUserFriendship.save();

      return handleResponse(
        res,
        200,
        "Following new friend!",
        {
          friendship: findFromUserFriendship,
        },
        true
      );
    }

    // check if the friendship already exists
    const findToUserFriendship = await Friendship.findOne({
      from_user: toUser,
      to_user: fromUser,
    });

    if (findToUserFriendship) {
      // update the status of the friendship
      findToUserFriendship.status = "accepted";
      await findToUserFriendship.save();

      return handleResponse(
        res,
        200,
        "Following new friend!",
        {
          friendship: findToUserFriendship,
        },
        true
      );
    }

    // if the friendship does not exist, first create a new chat room
    const chatRoom = await ChatRoom.create({
      type: "private",
      users: [fromUser, toUser],
    });

    // create a new friendship for the from user
    const fromUserFriendship = await Friendship.create({
      from_user: {
        _id: fromUser._id,
        name: fromUser.name,
        avatar: fromUser.avatar,
      },
      to_user: {
        _id: toUser._id,
        name: toUser.name,
        avatar: toUser.avatar,
      },
      status: "accepted",
      chat_room: chatRoom._id,
    });

    // create a new friendship for the to user
    const toUserFriendship = await Friendship.create({
      from_user: toUser._id,
      to_user: fromUser._id,
      status: "pending",
      chat_room: chatRoom._id,
    });

    // push the friendship to the from user
    fromUser.friendships.push(fromUserFriendship);
    await fromUser.save();

    // push the friendship to the to user
    toUser.friendships.push(toUserFriendship);
    await toUser.save();

    const friendship = await Friendship.findOne({
      from_user: value.from_user,
      to_user: value.to_user,
    }).populate("to_user");

    return handleResponse(
      res,
      200,
      "Following new friend!",
      {
        friendship: friendship,
      },
      true
    );
  } catch (error) {
    return handleResponse(res, 500, "Internal server error", { error }, false);
  }
};

module.exports.remove = async function (req, res) {
  try {
    // validate the request query
    const { value, error } = fieldsValidator.validate(req.query);

    if (error) {
      return handleResponse(res, 422, "Invalid fields", { error }, false);
    }

    const friendship = await Friendship.findOne({
      from_user: value.from_user,
      to_user: value.to_user,
    });

    // update the status of the friendship
    friendship.status = "deleted";
    friendship.save();

    return handleResponse(
      res,
      200,
      "Unfollowed friend!",
      {
        friendship: friendship,
      },
      true
    );
  } catch (error) {
    return handleResponse(res, 500, "Internal server error", { error }, false);
  }
};
