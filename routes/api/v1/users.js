const express = require('express');
const { checkToken } = require('../../../config/check_token');
const router = express.Router();

const usersApi = require('../../../controllers/api/v1/users_api');

router.post('/login', usersApi.createSession);
router.get('/profile/:id', checkToken, usersApi.profile);

module.exports = router;