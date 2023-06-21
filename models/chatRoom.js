const mongoose = require("mongoose");

const { Schema } = mongoose;

const chatRoomSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      from_user: {
        _id: {
          type: String,
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        email: {
          type: String,
        },
      },
      message: {
        type: String,
      },
      timestamp: {
        type: Date,
      },
    },
    messages: [
      {
        sender: {
          _id: {
            type: String,
          },
          name: {
            type: String,
          },
          avatar: {
            type: String,
          },
          email: {
            type: String,
          },
        },
        receiver: {
          _id: {
            type: String,
          },
          name: {
            type: String,
          },
          avatar: {
            type: String,
          },
          email: {
            type: String,
          },
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
        },
        updatedAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model("OldChatRoom", chatRoomSchema);
module.exports = ChatRoom;
