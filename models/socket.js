const mongoose = require("mongoose");

const SocketSchema = new mongoose.Schema({
  mapData: {
    type: Map,
    required: true,
  },
});

const Socket = mongoose.model("Socket", SocketSchema);

module.exports = Socket;
