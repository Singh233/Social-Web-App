const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');
const signInController = require('../controllers/users_controller');
const signUpController = require('../controllers/users_controller');

router.get('/profile/:id', passport.checkAuthentication, usersController.profile);
router.get('/profile/edit/:id', passport.checkAuthentication, usersController.editProfile);
router.post('/update/:id', passport.checkAuthentication, usersController.update);
router.get('/sign-up', signInController.signUp);
router.get('/sign-in', signUpController.signIn);
router.get('/sign-in-up', signInController.signIn);

router.use('/friends', require('./friends'));


router.post('/create', usersController.create);

// user passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'}
), usersController.createSession);


router.get('/sign-out', usersController.destroySession);


router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/users/sign-in'}), usersController.createSession);



module.exports = router;