const { v4: uuidV4 } = require("uuid");

module.exports.call = function (request, response) {
  return response.redirect(`/call/video/${uuidV4()}`);
};

module.exports.video = function (request, response) {
  return response.render("room", {
    roomId: request.params.room,
    title: "Video call",
  });
};
