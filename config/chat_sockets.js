/* eslint-disable no-restricted-syntax */
const moment = require("moment");
const socketIo = require("socket.io");

const Socket = require("../models/socket");

module.exports.chatSockets = function (socketServer) {
  const io = socketIo(socketServer, {
    cors: {
      origin: "*",
    },
  });
  // make a map of all the users
  let activeUsers = new Map();
  // get the map from the database
  Socket.find({}, function (err, map) {
    if (err) {
      return;
    }
    activeUsers = new Map(map[0].mapData);
  });

  async function updateSocketsMap() {
    // remove the map from the database
    await Socket.deleteMany({});

    // add the map to the database
    await Socket.create({
      mapData: activeUsers,
    });
  }

  io.sockets.on("connection", function (socket) {
    // console.log('new connection received', socket.id);

    activeUsers.set(socket.handshake.query.userId, {
      userId: socket.handshake.query.userId,
      socketId: socket.id,
      status: "Active now",
      timeStamp: new Date(),
      moment: moment(new Date()).fromNow(),
    });

    // UPDATE connection counter on the home page
    io.sockets.emit("connections", {
      count: io.engine.clientsCount,
    });

    // For react users to get the active users
    io.sockets.emit("get_users", {
      users: [...activeUsers.values()],
    });

    // update status of user
    socket.on("user_online", async function (data) {
      const { userId } = socket.handshake.query;

      // check if activeUsers map has the userid
      if (activeUsers.has(userId)) {
        activeUsers.set(userId, {
          userId: data.user_id,
          socketId: socket.id,
          status: "Active now",
          timeStamp: new Date(),
          moment: moment(new Date()).fromNow(),
        });
      }
      // Update the moment of all the users
      for (const [key, value] of activeUsers) {
        value.moment = moment(value.timeStamp).fromNow();
      }

      const map = [...activeUsers.values()];
      io.sockets.emit("update_status", {
        map,
      });

      await updateSocketsMap();
    });

    socket.on("disconnect", async function () {
      io.sockets.emit("connections", {
        count: io.engine.clientsCount,
      });

      const { userId } = socket.handshake.query;

      // update status of user to offline and emit to all users
      if (activeUsers.has(userId)) {
        activeUsers.set(userId, {
          userId: activeUsers.get(userId).userId,
          socketId: socket.id,
          status: "offline",
          timeStamp: new Date(),
          moment: moment(new Date()).fromNow(),
        });
      }
      // Update the moment of all the users
      for (const [key, value] of activeUsers) {
        value.moment = moment(value.timeStamp).fromNow();
      }

      const map = [...activeUsers.values()];
      io.sockets.emit("update_status", {
        map,
      });

      await updateSocketsMap();
    });

    // public chat room
    socket.on("join_global_room", function (data) {
      socket.join(data.chatroom);
      io.in(data.chatroom).emit("global_user_joined", data);
    });

    // detect send_message and broadcast toe everyone in the room
    socket.on("send_global_message", function (data) {
      io.in(data.chatroom).emit("receive_global_message", data);
    });

    // Join private chat room
    socket.on("join_private_room", function (data) {
      // check if a room already exists
      const chatRoom = data.chatroom;

      if (io.sockets.adapter.rooms.get(chatRoom)) {
        // leave the room
        socket.leave(chatRoom);
      }

      socket.join(chatRoom);
      io.in(chatRoom).emit("private_user_joined", data);
    });

    // Send private message to a user
    socket.on("send_private_message", function (data) {
      // check if a room already exists
      const chatRoom = data.chatroom;

      io.in(chatRoom).emit("receive_private_message", data);

      // emit notification to the receiver of the message only
      if (activeUsers.has(data.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(data.to_user).socketId).emit(
          "receive_notification",
          data
        );
      }
    });

    // listen for typing event
    socket.on("typingPrivate", function (data) {
      // console.log('typing event received')
      io.in(data.chatroom).emit("typingResponsePrivate", data);
    });

    // listen for typing event
    socket.on("typingGlobal", function (data) {
      io.in(data.chatroom).emit("typingResponseGlobal", data);
    });
  });
};
