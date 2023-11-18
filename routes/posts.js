const express = require("express");

const router = express.Router();
const passport = require("passport");

const postsController = require("../controllers/posts_controller");

router.post(
  "/create/:id",
  passport.checkAuthentication,
  postsController.createPost
);
router.get(
  "/destroy/:id",
  passport.checkAuthentication,
  postsController.destroy
);

// router to save post
router.post(
  "/save/:id",
  passport.checkAuthentication,
  postsController.savePost
);

// router to unsave post
router.post(
  "/unsave/:id",
  passport.checkAuthentication,
  postsController.unsavePost
);

router.get(
  "/post/:postId",
  passport.checkAuthentication,
  postsController.viewSinglePost
);

module.exports = router;
