/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-syntax */
const moment = require("moment");
const socketIo = require("socket.io");
const http = require("http");

const Socket = require("../models/socket");
const { update } = require("lodash");

function emitToUserFromUser(io, activeUsers, data, message) {
  if (activeUsers.has(data.from_user)) {
    // emit notification to the receiver of the message only
    io.to(activeUsers.get(data.from_user).socketId).emit(message, data);
  }
  if (activeUsers.has(data.to_user)) {
    // emit notification to the receiver of the message only
    io.to(activeUsers.get(data.to_user).socketId).emit(message, data);
  }
}

function addToDB(msg, fromUser, toUser, chatRoom) {
  const options = {
    hostname: "sanam.social", // server's hostname
    port: 80, // server's port
    path: "/api/v1/chat/createmessage/", // API endpoint you want to call
    method: "POST", // POST HTTP method
    headers: {
      "Content-Type": "application/json", // Set the content type of the request body
    },
  };
  const requestBody = JSON.stringify({
    message: msg,
    type: "private",
    sender: fromUser,
    receiver: toUser,
    chatRoomId: chatRoom,
    messageType: "call",
  });

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      // console.log("Response:", data);
      // Do something with the response data
    });
  });

  req.on("error", (error) => {
    // console.error("Error:", error);
  });

  req.write(requestBody); // Write the request body
  req.end();
}

module.exports.chatSockets = function (socketServer) {
  const io = socketIo(socketServer, {
    cors: {
      origin: "*",
    },
  });

  const CALL_STATES = {
    IDLE: "idle",
    ANSWERED: "answered",
    RINGING: "ringing",
  };

  // make a map of all the users
  let activeUsers = new Map();
  // get the map from the database
  Socket.find({}, function (err, map) {
    if (err || !map || !map[0]) {
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
  function updateCallState(fromUser, toUser, callState) {
    // check if activeUsers map has the from user/ to user and update call state
    if (activeUsers.has(fromUser)) {
      activeUsers.set(fromUser, {
        ...activeUsers.get(fromUser),
        callState: callState,
        isCaller: true,
      });
    }
    if (activeUsers.has(toUser)) {
      activeUsers.set(toUser, {
        ...activeUsers.get(toUser),
        callState: callState,
        isCaller: false,
      });
    }
  }

  io.sockets.on("connection", function (socket) {
    // console.log('new connection received', socket.id);

    activeUsers.set(socket.handshake.query.userId, {
      userId: socket.handshake.query.userId,
      socketId: socket.id,
      status: "Active now",
      callState: CALL_STATES.IDLE,
      isCaller: false,
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
          callState: CALL_STATES.IDLE,
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
          ...activeUsers.get(userId),
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
      // io.in(chatRoom).emit("private_user_joined", data);
    });

    socket.on("join_video_call", (data) => {
      // io.in(data.callRoomId).emit("user_calling", data);

      socket.on("disconnect", () => {
        const msgData = {
          message: "Video call ended",
          messageType: "call",
          user_name: data.user_name,
          user_email: data.user_email,
          user_profile: data.user_profile,
          time: new Date().toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          }),
          from_user: data.from_user,
          to_user: data.to_user,
          chatroom: data.callRoomId,
          socketDisconnect: true,
        };
        if (activeUsers.has(data.to_user)) {
          // emit notification to the receiver of the message only
          io.to(activeUsers.get(data.to_user).socketId).emit(
            "call_user_disconnected",
            msgData
          );
        }
        if (
          activeUsers.has(data.from_user) &&
          activeUsers.get(data.from_user).isCaller &&
          (activeUsers.get(data.from_user).callState === CALL_STATES.ANSWERED ||
            activeUsers.get(data.from_user).callState === CALL_STATES.RINGING)
        ) {
          addToDB(
            "Video call ended",
            data.from_user,
            data.to_user,
            data.callRoomId
          );
          updateCallState(data.from_user, data.to_user, CALL_STATES.IDLE);
        }
      });
    });

    socket.on("user_is_calling", (data) => {
      if (activeUsers.has(data.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(data.to_user).socketId).emit(
          "user_is_calling_notification",
          data
        );
      }
      updateCallState(data.from_user, data.to_user, CALL_STATES.RINGING);
    });

    socket.on("user_answered_call", (newData) => {
      if (activeUsers.has(newData.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(newData.to_user).socketId).emit(
          "call_user_connected",
          newData
        );
      }
      updateCallState(newData.to_user, newData.from_user, CALL_STATES.ANSWERED);
    });

    socket.on("user_on_another_call", (data) => {
      if (activeUsers.has(data.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(data.to_user).socketId).emit("user_busy", data);
      }
      updateCallState(data.to_user, data.from_user, CALL_STATES.ANSWERED);
    });

    socket.on("user_declined_call", (data) => {
      if (activeUsers.has(data.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(data.to_user).socketId).emit(
          "user_declined_call_notification",
          data
        );
      }
      updateCallState(data.to_user, data.from_user, CALL_STATES.ANSWERED);
    });

    socket.on("call_mic_toggle", (data) => {
      emitToUserFromUser(io, activeUsers, data, "mic_toggled");
    });

    socket.on("call_camera_toggle", (data) => {
      emitToUserFromUser(io, activeUsers, data, "camera_toggled");
    });

    socket.on("user_leaving_call", (data) => {
      emitToUserFromUser(io, activeUsers, data, "user_left_call");
      updateCallState(data.from_user, data.to_user, CALL_STATES.IDLE);
    });

    // Send private message to a user
    socket.on("send_private_message", function (data) {
      io.in(data.chatroom).emit("receive_private_message", data);

      if (activeUsers.has(data.to_user)) {
        // emit notification to the receiver of the message only
        io.to(activeUsers.get(data.to_user).socketId).emit(
          "receive_notification",
          data
        );
      }

      if (activeUsers.has(data.from_user)) {
        // emit notification to the sender of the message
        io.to(activeUsers.get(data.from_user).socketId).emit(
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
