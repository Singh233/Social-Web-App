const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    chatRoomId: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
