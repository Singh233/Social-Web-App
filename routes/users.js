const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');
const signInController = require('../controllers/users_controller');
const signUpController = require('../controllers/users_controller');

router.get('/profile/:id', passport.checkAuthentication, usersController.profile);
router.get('/sign-up', signInController.signUp);
router.get('/sign-in', signUpController.signIn);


router.post('/create', usersController.create);

// user passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'}
), usersController.createSession);


router.get('/sign-out', usersController.destroySession);
module.exports = router;