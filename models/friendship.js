const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    // the user who sent the request
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // the user who accepted the request
    to_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // the status of the friendship
    status: {
      type: String,
      enum: ["accepted", "pending", "deleted"],
      default: "pending",
    },

    // the chat room id for the friendship
    chat_room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
  },
  {
    timestamps: true,
  }
);

const Friendship = mongoose.model("Friendship", friendshipSchema);
module.exports = Friendship;
