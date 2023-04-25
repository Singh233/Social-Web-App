const env = require('./environment');
const moment = require('moment');
const Socket = require('../models/socket');
// const fetch = require('node-fetch');

module.exports.chatSockets = function (socketServer) {
    let io = require('socket.io')(socketServer, {
        cors: {
            origin: '*',
        },
    });
    // make a map of all the users
    let activeUsers = new Map();
    // get the map from the database
    Socket.find({}, function (err, map) {
        if (err) {
            console.log('----Error in fetching sockets from db----');
            return;
        }
        try {
            activeUsers = new Map(map[0].mapData);
        } catch (error) {
            console.log('----Sockets map is empty----');
        }
    });


    io.sockets.on('connection', function (socket) {
        // console.log('new connection received', socket.id);

        activeUsers.set(socket.handshake.query.userId, {
            userId: socket.handshake.query.userId,
            socketId: socket.id,
            status: 'Active now',
            timeStamp: new Date(),
            moment: moment(new Date()).fromNow(),
        });

        // UPDATE connection counter on the home page
        io.sockets.emit('connections', {
            count: io.engine.clientsCount,
        });

        // For react users to get the active users
        io.sockets.emit('get_users', {
            users: [...activeUsers.values()],
        });

        // update status of user
        socket.on('user_online', async function (data) {
            let key = socket.handshake.query.userId;

            // check if activeUsers map has the userid
            if (activeUsers.has(key)) {
                activeUsers.set(key, {
                    userId: data.user_id,
                    socketId: socket.id,
                    status: 'Active now',
                    timeStamp: new Date(),
                    moment: moment(new Date()).fromNow(),
                });
            }
            // Update the moment of all the users
            for (let [key, value] of activeUsers) {
                value.moment = moment(value.timeStamp).fromNow();
                console.log(value.moment);
            }

            console.log(activeUsers);
            let map = [...activeUsers.values()];
            io.sockets.emit('update_status', {
                map,
            });

            // Searialize the activeUsers map and store it in the database
            let mapData = [...activeUsers];

            await updateSocketsMap();
        });

        socket.on('disconnect', async function () {
            console.log('socket disconnected!');

            io.sockets.emit('connections', {
                count: io.engine.clientsCount,
            });

            let key = socket.handshake.query.userId;

            // update status of user to offline and emit to all users
            if (activeUsers.has(key)) {
                activeUsers.set(key, {
                    userId: activeUsers.get(key).userId,
                    socketId: socket.id,
                    status: 'offline',
                    timeStamp: new Date(),
                    moment: moment(new Date()).fromNow(),
                });
            }
            // Update the moment of all the users
            for (let [key, value] of activeUsers) {
                value.moment = moment(value.timeStamp).fromNow();
            }
            console.log(activeUsers);
            let map = [...activeUsers.values()];
            io.sockets.emit('update_status', {
                map,
            });

            await updateSocketsMap();

        });

        // public chat room
        socket.on('join_global_room', function (data) {
            console.log('joining request recieved', data);

            socket.join(data.chatroom);
            io.in(data.chatroom).emit('global_user_joined', data);

        });

        // detect send_message and broadcast toe everyone in the room
        socket.on('send_global_message', function (data) {
            console.log('message received___-----', data);
            io.in(data.chatroom).emit('receive_global_message', data);

            
        });

        // Join private chat room
        socket.on('join_private_room', function (data) {
            console.log('joining request recieved', data);

            // check if a room already exists
            let chatRoom = data.from_user + data.to_user;
            let reverseChatRoom = data.to_user + data.from_user;



            if (io.sockets.adapter.rooms.get(chatRoom)) {
                console.log(chatRoom, 'already exists');
                data.chatroom = chatRoom;
                // leave the room
                socket.leave(chatRoom);
            } else if (io.sockets.adapter.rooms.get(reverseChatRoom)) {
                console.log(reverseChatRoom, 'reverse already exists');
                data.chatroom = reverseChatRoom;
                // leave the room
                socket.leave(reverseChatRoom);
            } else {
                console.log(chatRoom, 'new room created');
                data.chatroom = chatRoom;
            }

            socket.join(data.chatroom);
            io.in(data.chatroom).emit('private_user_joined', data);
        });

        // Send private message to a user
        socket.on('send_private_message', function (data) {
            console.log('message received___-----', data);

            // check if a room already exists
            let chatRoom = data.from_user + data.to_user;
            let reverseChatRoom = data.to_user + data.from_user;

            if (io.sockets.adapter.rooms.get(chatRoom)) {
                // console.log(chatRoom, "already exists")
                data.chatroom = chatRoom;
            } else if (io.sockets.adapter.rooms.get(reverseChatRoom)) {
                // console.log(reverseChatRoom, "already exists")
                data.chatroom = reverseChatRoom;
            } else {
                // console.log("new room created")
                data.chatroom = chatRoom;
            }

            io.in(data.chatroom).emit('receive_private_message', data);

            // emit notification to the receiver of the message only
            if (activeUsers.has(data.to_user)) {
                io.to(activeUsers.get(data.to_user).socketId).emit('receive_notification', data);
            }
        });

        // listen for typing event
        socket.on('typingPrivate', function (data) {
            // console.log('typing event received')
            if (io.sockets.adapter.rooms.get(data.from_user + data.to_user)) {
                io.in(data.from_user + data.to_user).emit('typingResponsePrivate', data);
            } else if (io.sockets.adapter.rooms.get(data.to_user + data.from_user)) {
                io.in(data.to_user + data.from_user).emit('typingResponsePrivate', data);
            }
        });

        // listen for typing event
        socket.on('typingGlobal', function (data) {

            io.in(data.chatroom).emit('typingResponseGlobal', data);
        } );
    });

    async function updateSocketsMap() {
        // remove the map from the database
        await Socket.deleteMany({});

        // add the map to the database
        await Socket.create({
            mapData: activeUsers,
        });
    }
};
