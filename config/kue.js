const kue = require("kue");

const queue = kue.createQueue({
  redis: {
    host: "172.17.0.2", // Redis container IP address
    port: 6379, // Redis default port
  },
});

module.exports = queue;
