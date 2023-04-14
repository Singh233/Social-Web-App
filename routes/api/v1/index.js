const express = require('express');
const router = express.Router();



router.use('/posts', require('./posts'));
router.use('/users', require('./users'));
router.use('/likes', require('./likes'));
router.use('/chat', require('./chat'));
router.use('/comments', require('./comments'));
router.use('/friends', require('./friends'));

module.exports = router;