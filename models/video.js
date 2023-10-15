const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String },
    size: { type: Number },
    duration: { type: Number },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    quality_360p: { type: String },
    quality_720p: { type: String },
    quality_1080p: { type: String },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
