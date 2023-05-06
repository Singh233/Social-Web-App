const express = require("express");

const router = express.Router();
const passport = require("passport");

const likesApi = require("../../../controllers/api/v1/likes_api");

router.post(
  "/toggle",
  passport.authenticate("jwt", { session: false }),
  likesApi.toggleLike
);

module.exports = router;
