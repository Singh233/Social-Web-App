const express = require('express');
const router = express.Router();
const passport = require('passport');
const { checkToken } = require('../../../config/check_token');

const commentsApi = require('../../../controllers/api/v1/comments_api');

router.post('/create', checkToken, commentsApi.create);
router.post('/destroy/:id', checkToken, commentsApi.destroy);

module.exports = router;