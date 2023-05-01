const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersApi = require('../../../controllers/api/v1/users_api');

router.post('/login', usersApi.createSession);
router.get('/profile/:id', passport.authenticate('jwt', {session: false}), usersApi.profile);
router.post('/create', usersApi.create);

router.post(
    '/login/google',
    usersApi.createGoogleSession,
);

router.get('/sign-out', usersApi.destroySession);

// router.get(
//     '/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     usersApi.createSession
// );

module.exports = router;