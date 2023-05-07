// eslint-disable-next-line import/no-extraneous-dependencies
const Joi = require("joi");

const Chat = require("../../../models/chat");
const ChatRoom = require("../../../models/chatRoom");

const paramsValidator = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  type: Joi.string().valid("global", "private").required(),
  message: Joi.string(),
  chatRoomId: Joi.string(),
});

function handleResponse(res, status, message, data, success) {
  const response = {
    message,
    data,
    success,
  };
  return res.status(status).json(response);
}

async function joinGlobalChatRoom(chatRoomId, data, res) {
  // find the chat room
  const chatRoom = await ChatRoom.findOne({ type: data.type })
    .populate("messages")
    .populate({
      path: "messages",
      populate: {
        path: "sender",
      },
    });

  // if the chat room already exists then return the chat room
  if (chatRoom) {
    // check if the user is already present in the chat room
    const userExists = chatRoom.users.find(
      (user) => user.toString() === data.sender
    );

    // if user is not present then add the user to the chat room
    if (!userExists) {
      chatRoom.users.push(data.sender);
      await chatRoom.save();
    }

    return handleResponse(
      res,
      200,
      "Global Chat room exists",
      { chatRoom },
      true
    );
  }

  // else create a new chat room and return it
  const newChatRoom = await ChatRoom.create({
    type: data.type,
    users: [data.sender],
  });

  return handleResponse(
    res,
    200,
    "Global Chat room created",
    { chatRoom: newChatRoom },
    true
  );
}

async function joinPrivateChatRoom(data, res) {
  const { chatRoomId } = data;

  // find the chat room
  const chatRoom = await ChatRoom.findById(chatRoomId)
    .populate("messages")
    .populate({
      path: "messages",
      populate: {
        path: "sender",
      },
    })
    .populate({
      path: "messages",
      populate: {
        path: "receiver",
      },
    });

  return handleResponse(res, 200, "Chat room exists", { chatRoom }, true);
}

async function createGlobalMessage(data, res) {
  const { sender, message } = data;
  // find the chat room
  const chatRoom = await ChatRoom.findOne({ type: data.type });

  // create a new chat message
  const chat = await Chat.create({
    sender: sender,
    receiver: sender,
    message: message,
    chatRoomId: chatRoom._id,
  });

  // push the chat message to the chatRoom
  chatRoom.messages.push(chat);
  await chatRoom.save();

  return handleResponse(res, 200, "Message sent", { chat }, true);
}

async function createPrivateMessage(data, res) {
  const { sender, receiver, message, chatRoomId } = data;

  // find the chat room
  const chatRoom = await ChatRoom.findById(chatRoomId);

  // create a new chat message
  const chat = await Chat.create({
    sender: sender,
    receiver: receiver,
    message: message,
    chatRoomId: chatRoomId,
  });

  // push the chat message to the chatRoom
  chatRoom.messages.push(chat);
  await chatRoom.save();

  return handleResponse(res, 200, "Message sent", { chat }, true);
}

module.exports.joinChatRoom = async function (req, res) {
  // validate the request params
  const { error, value } = paramsValidator.validate(req.params);

  // if the request params are invalid then return the error
  if (error) {
    return handleResponse(res, 400, error.message, null, false);
  }

  const data = value;

  // join a chat room based on the type
  switch (data.type) {
    case "global":
      try {
        const chatRoomId = data.type; // In case of global chat room, chat room id is "global"
        return await joinGlobalChatRoom(chatRoomId, data, res);
      } catch (exceptionError) {
        return handleResponse(res, 500, "Internal server error!", null, false);
      }
    case "private":
      try {
        return await joinPrivateChatRoom(data, res);
      } catch (exceptionError) {
        return handleResponse(res, 500, "Internal server error!", null, false);
      }
    default:
      return handleResponse(res, 400, "Invalid chat room type", null, false);
  }
};

// controller for creating a chat message
module.exports.createMessage = async function (req, res) {
  // validate the request params
  const { error, value } = paramsValidator.validate(req.params);

  if (error) {
    return handleResponse(res, 400, error.message, null, false);
  }

  const data = value;

  // create a new chat message based on the type
  switch (data.type) {
    case "global":
      try {
        return await createGlobalMessage(data, res);
      } catch (exceptionError) {
        return handleResponse(res, 500, "Internal server error!", null, false);
      }
    case "private":
      try {
        return await createPrivateMessage(data, res);
      } catch (exceptionError) {
        return handleResponse(res, 500, "Internal server error!", null, false);
      }
    default:
      return handleResponse(res, 400, "Invalid chat room type", null, false);
  }
};
