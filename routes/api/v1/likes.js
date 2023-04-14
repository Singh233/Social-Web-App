const express = require('express');
const { checkToken } = require('../../../config/check_token');
const router = express.Router();

const likesApi = require('../../../controllers/api/v1/likes_api');

router.post('/toggle', checkToken, likesApi.toggleLike);


module.exports = router;