const express = require("express");
const passport = require("passport");

const router = express.Router();
const postsApi = require("../../../controllers/api/v1/post_api");

router.get("/", postsApi.index);

router.get("/index", postsApi.getPosts);

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  postsApi.createPost
);

router.post(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  postsApi.destroy
);

// router to save post
router.post(
  "/save/:id",
  passport.authenticate("jwt", { session: false }),
  postsApi.savePost
);

// router to unsave post
router.post(
  "/unsave/:id",
  passport.authenticate("jwt", { session: false }),
  postsApi.unsavePost
);

router.get(
  "/post/:postId",
  passport.authenticate("jwt", { session: false }),
  postsApi.getSinglePost
);

module.exports = router;
