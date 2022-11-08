const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users_controller');
const signInController = require('../controllers/users_controller');
const signUpController = require('../controllers/users_controller');

router.get('/profile', usersController.profile);
router.get('/sign-up', signInController.signUp);
router.get('/sign-in', signUpController.signIn);

router.post('/create', usersController.create);


module.exports = router;