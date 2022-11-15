const mongoose = require('mongoose');
const { posts } = require('../controllers/posts_controller');
const { post } = require('../routes');


const postSchema = new mongoose.Schema({
    content: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {
    timestamps: true
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;