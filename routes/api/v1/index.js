const express = require("express");

const router = express.Router();
const passport = require("passport");

router.use("/posts", require("./posts"));
router.use("/users", require("./users"));
router.use(
  "/likes",
  passport.authenticate("jwt", { session: false }),
  require("./likes")
);
router.use("/chat", require("./chat"));
router.use(
  "/comments",
  passport.authenticate("jwt", { session: false }),
  require("./comments")
);
router.use(
  "/friends",
  passport.authenticate("jwt", { session: false }),
  require("./friends")
);

module.exports = router;
