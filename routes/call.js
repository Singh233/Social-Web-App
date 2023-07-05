const express = require("express");

const router = express.Router();
const callController = require("../controllers/call_controller.js");

router.get("/", callController.call);

router.get("/video/:room", callController.video);

module.exports = router;
