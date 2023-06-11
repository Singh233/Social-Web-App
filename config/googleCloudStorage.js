/* eslint-disable import/no-extraneous-dependencies */
const Cloud = require("@google-cloud/storage");
const path = require("path");

const serviceKey = path.join(__dirname, "../googleCloudKey.json");

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: serviceKey,
  projectId: "codeial-369806",
});

module.exports = storage;
