const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const AVATAR_PATH = path.join("/uploads/users/avatars");

// Creating Schema
const usersSchema = new mongoose.Schema(
  {
    platformRank: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true },
    avatar: { type: String },
    googleProfile: { type: String },
    friendships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Friendship",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Friendship",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Friendship",
      },
    ],
    friends: [],
  },
  {
    timestamps: true,
  }
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", AVATAR_PATH));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// static methods

usersSchema.statics.uploadedAvatar = multer({ storage: storage }).single(
  "filepond"
);
usersSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model("User", usersSchema);

module.exports = User;
