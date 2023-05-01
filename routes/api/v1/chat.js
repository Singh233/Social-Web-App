const express = require('express');
const router = express.Router();
const chatApi = require('../../../controllers/api/v1/chat_api');

router.get('/:type/:sender/:receiver', chatApi.createChatRoom);

router.post('/createmessage/:message/:sender/:receiver', chatApi.createChat);

module.exports = router;