const mongoose = require('mongoose');
const env = require('../config/environment');

const SocketSchema = new mongoose.Schema({
    mapData: {
        type: Map,
        required: true,
    },
});

const Socket = mongoose.model('Socket', SocketSchema);

module.exports = Socket;