const express = require('express');
const router = express.Router();
const { checkToken } = require('../../../config/check_token');

const friendsApi = require('../../../controllers/api/v1/friends_api');

router.post('/add', checkToken, friendsApi.add);
router.post('/remove', checkToken, friendsApi.remove);


module.exports = router;