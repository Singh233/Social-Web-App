const express = require('express');
const router = express.Router();
const passport = require('passport');

const friendsApi = require('../../../controllers/api/v1/friends_api');

router.post('/add', passport.authenticate('jwt', {session: false}), friendsApi.add);
router.post('/remove', passport.authenticate('jwt', {session: false}), friendsApi.remove);


module.exports = router;