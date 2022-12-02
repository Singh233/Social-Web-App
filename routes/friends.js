const express = require('express');
const router = express.Router();

const friendsController = require('../controllers/friends_controller');

router.get('/add', friendsController.add);
router.get('/remove', friendsController.remove);


module.exports = router;