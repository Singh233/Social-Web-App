const express = require("express");

const router = express.Router();
const chatApi = require("../../../controllers/api/v1/chat_api");

router.get("/:type/:sender/:receiver/:chatRoomId", chatApi.joinChatRoom);

router.post("/createmessage/", chatApi.createMessage);

module.exports = router;
