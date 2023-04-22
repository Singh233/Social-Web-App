const express = require('express');
const router = express.Router();
const passport = require('passport');

const commentsApi = require('../../../controllers/api/v1/comments_api');

router.post('/create', passport.authenticate('jwt', {session: false}), commentsApi.create);
router.post('/destroy/:id', passport.authenticate('jwt', {session: false}), commentsApi.destroy);

module.exports = router;