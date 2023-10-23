const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    isImg: { type: Boolean, required: true },
    imgPath: { type: String },
    thumbnail: { type: String },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    caption: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // include the array of ids of all comments in this post schema itself
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "..", FILE_PATH));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${file.fieldname}-${uniqueSuffix}`);
//   },
// });

// // static methods

// postSchema.statics.uploadedFile = multer({ storage: storage }).single(
//   "filepond"
// );
// postSchema.statics.filePath = FILE_PATH;

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
