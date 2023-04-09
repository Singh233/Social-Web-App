const env = require('./environment');


module.exports.chatSockets = function(socketServer){
    let io = require('socket.io')(socketServer);
    // make a map of all the users
    let activeUsers = new Map();

    io.sockets.on('connection', function(socket){
        console.log('new connection received', socket.id);

        // add user to the map
        activeUsers.set(socket.id, {
            userId: socket.request._query.userId
        });


        // UPDATE connection counter on the home page
        io.sockets.emit('connections', {
            count: io.engine.clientsCount
        });
        
        // update status of user
        socket.on('user_online', function(data) {
            // check if activeUsers map has the userid
            if (activeUsers.has(socket.id)) {
                activeUsers.set(socket.id, {
                    userId: data.user_id,
                    status: 'online'
                });
            }
            console.log(activeUsers);
            let map = [...activeUsers.values()];
            io.sockets.emit('update_status', {
                map
            })
        })


        socket.on('disconnect', function(){
            

            console.log('socket disconnected!');
            io.sockets.emit('connections', {
                count: io.engine.clientsCount
            });

            // update status of user to offline and emit to all users
            if (activeUsers.has(socket.id)) {
                activeUsers.set(socket.id, {
                    userId: activeUsers.get(socket.id).userId,
                    status: 'offline'
                });
            }
            console.log(activeUsers);
            let map = [...activeUsers.values()];
            io.sockets.emit('update_status', {
                map
            })

            // io.sockets.emit('update_status', {
            //     data
            // })
        });


        // public chat room
        socket.on('join_global_room', function(data) {
            console.log('joining request recieved', data);

            socket.join(data.chatroom);
            io.in(data.chatroom).emit('user_joined', data);
        });

        // detect send_message and broadcast toe everyone in the room
        socket.on('send_global_message', function(data) {
            console.log("message received___-----", data);
            io.in(data.chatroom).emit('receive_global_message', data);
        })

        // Join private chat room
        socket.on('join_private_room', function(data) {
            console.log('joining request recieved', data);


            // check if a room already exists
            let chatRoom = data.from_user + data.to_user;
            let reverseChatRoom = data.to_user + data.from_user;

            

            if (io.sockets.adapter.rooms.get(chatRoom)) {
                console.log(chatRoom, "already exists")
                data.chatroom = chatRoom;
            } else if (io.sockets.adapter.rooms.get(reverseChatRoom)) {
                console.log(reverseChatRoom, "already exists")
                data.chatroom = reverseChatRoom;
            } else {
                console.log("new room created")
                data.chatroom = chatRoom;
            }
            
            socket.join(data.chatroom);
            io.in(data.chatroom).emit('user_joined', data);
        } );

        // Send private message to a user
        socket.on('send_private_message', function(data) {

            console.log("message received___-----", data);

            // check if a room already exists
            let chatRoom = data.from_user + data.to_user;
            let reverseChatRoom = data.to_user + data.from_user;
            

            if (io.sockets.adapter.rooms.get(chatRoom)) {
                console.log(chatRoom, "already exists")
                data.chatroom = chatRoom;
            } else if (io.sockets.adapter.rooms.get(reverseChatRoom)) {
                console.log(reverseChatRoom, "already exists")
                data.chatroom = reverseChatRoom;
            } else {
                console.log("new room created")
                data.chatroom = chatRoom;
            }

            io.in(data.chatroom).emit('receive_private_message', data);
        } );
        

    });

}