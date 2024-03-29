/* eslint-disable no-console */

const express = require("express");
const passport = require("passport");

const router = express.Router();
const homeController = require("../controllers/home_controller");

console.log("router loaded");

router.get("/", homeController.redirectToHome);
router.get("/home", passport.checkAuthentication, homeController.home);
router.get("/search", passport.checkAuthentication, homeController.search);
router.get("/upload", passport.checkAuthentication, homeController.upload);
router.use("/users", require("./users"));
router.use("/posts", require("./posts"));
router.use("/comments", require("./comments"));
router.use("/likes", require("./likes"));
router.use("/call", require("./call"));

router.use("/api", require("./api"));

// Catch-all route for undefined routes
// router.get("*", function (req, res) {
//   // Redirect to the home page or handle the situation as needed
//   res.redirect("/home");
// });

module.exports = router;
