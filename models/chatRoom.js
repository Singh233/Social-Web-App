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
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
