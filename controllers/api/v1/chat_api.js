const Chat = require('../../../models/chat');
const ChatRoom = require('../../../models/chatRoom');

module.exports.createChatRoom = async function (req, res) {
    try {
        const data = req.params;
        console.log(data);
        let chatRoomId = data.sender + data.receiver;
        let reverseChatRoomId = data.receiver + data.sender;

        if (data.type == 'global') {
            chatRoomId = data.type;
            ChatRoom.findOne({ chatRoomId: chatRoomId })
            .populate('messages')
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                },
            })
            .exec(function (err, chatRoom) {
                if (err) {
                    console.log('Error in finding chat room', err);
                    return;
                }
                if (chatRoom) {
                    return res.status(200).json({
                        message: 'Global Chat room exists',
                        data: {
                            chatRoom: chatRoom,
                        },
                    });
                } else {
                    // create a new chat room
                    ChatRoom.create(
                        {
                            chatRoomId: 'global',
                            type: data.type,
                            users: [data.sender],
                        },
                        function (err, chatRoom) {
                            if (err) {
                                console.log('Error in creating chat room', err);
                                return;
                            }
                            return res.status(200).json({
                                message: 'Chat room created',
                                data: {
                                    chatRoom: chatRoom,
                                },
                            });
                        }
                    );
                }
            });

        } else {

        
        // if the chat room already exists then return the chat room
        ChatRoom.findOne({ chatRoomId: data.receiver + data.sender })
            .populate('messages')
            .populate({
                path: 'messages',
                populate: {
                    path: 'sender',
                },
            })
            .populate({
                path: 'messages',
                populate: {
                    path: 'receiver',
                },
            })
            .exec(function (err, chatRoom) {
                if (err) {
                    console.log('Error in finding chat room');
                    return;
                }
                if (chatRoom) {
                    return res.status(200).json({
                        message: 'Chat room already exists',
                        data: {
                            chatRoom: chatRoom,
                        },
                    });
                } else {
                    // try to find the chat room in the reverse order
                    ChatRoom.findOne({ chatRoomId: data.sender + data.receiver })
                        .populate('messages')
                        .populate({
                            path: 'messages',
                            populate: {
                                path: 'sender',
                            },
                        })
                        .populate({
                            path: 'messages',
                            populate: {
                                path: 'receiver',
                            },
                        })
                        .exec(function (err, chatRoom) {
                            if (err) {
                                console.log('Error in finding chat room');
                                return;
                            }
                            if (chatRoom) {
                                return res.status(200).json({
                                    message: 'Chat room already exists',
                                    data: {
                                        chatRoom: chatRoom,
                                    },
                                });
                            } else {
                                // create a new chat room
                                ChatRoom.create(
                                    {
                                        chatRoomId: data.sender + data.receiver,
                                        type: data.type,
                                        users: [data.sender, data.receiver],
                                    },
                                    function (err, chatRoom) {
                                        if (err) {
                                            console.log('Error in creating chat room');
                                            return;
                                        }
                                        return res.status(200).json({
                                            message: 'Chat room created',
                                            data: {
                                                chatRoom: chatRoom,
                                            },
                                        });
                                    }
                                );
                            }

                        });

                    
                }
            });
        }
            
    } catch (error) {
        console.log('Error', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};

// controller for creating a chat message
module.exports.createChat = async function (req, res) {
    try {
        const data = req.params;
        const body = req.body;
        let chatRoomId = null;
        console.log(data, body);

        if (data.receiver == 'all') {
            // find the chat room
            ChatRoom.findOne(
                { chatRoomId: 'global' },
                function (err, chatRoom) {
                    if (err) {
                        console.log('Error in finding chat room');
                        return;
                    }

                    if (chatRoom) {
                        // create a new chat message
                        chatRoomId = 'global';
                        Chat.create(
                            {
                                sender: data.sender,
                                receiver: data.sender,
                                message: data.message,
                                chatRoomId: chatRoomId,
                            },
                            function (err, chat) {
                                if (err) {
                                    console.log(
                                        'Error in creating chat message',
                                        err
                                    );
                                    return;
                                }
                                ChatRoom.findOneAndUpdate(
                                    {
                                        chatRoomId: chatRoomId,
                                    },
                                    {
                                        $push: {
                                            messages: chat._id,
                                        },
                                    },
                                    function (err, chatRoom) {  
                                        if (err) {
                                            console.log( 
                                                'Error in finding chat room'
                                            );
                                            return;
                                        }

                                        

                                        return res.status(200).json({
                                            message: 'Chat message created',
                                            data: {
                                                chat: chat,
                                            },
                                        });
                                    }); 
                            }
                        );
                    }
                }
            );
        }


        // find the chat room
        ChatRoom.findOne(
            { chatRoomId: data.sender + data.receiver },
            function (err, chatRoom) {
                if (err) {
                    console.log('Error in finding chat room');
                    return;
                }

                if (chatRoom) {
                    // create a new chat message
                    chatRoomId = chatRoom.chatRoomId;
                    Chat.create(
                        {
                            sender: data.sender,
                            receiver: data.receiver,
                            message: data.message,
                            chatRoomId: chatRoomId,
                        },
                        function (err, chat) {
                            if (err) {
                                console.log(
                                    'Error in creating chat message',
                                    err
                                );
                                return;
                            }
                            ChatRoom.findOneAndUpdate(
                                {
                                    chatRoomId: chatRoomId,
                                },
                                {
                                    $push: {
                                        messages: chat._id,
                                    },
                                },
                                function (err, chatRoom) {  
                                    if (err) {
                                        console.log( 
                                            'Error in finding chat room'
                                        );
                                        return;
                                    }

                                    

                                    return res.status(200).json({
                                        message: 'Chat message created',
                                        data: {
                                            chat: chat,
                                        },
                                    });
                                }); 
                        }
                    );
                } else {
                    // try to find the chat room in the reverse order
                    ChatRoom.findOne(
                        { chatRoomId: data.receiver + data.sender },
                        function (err, chatRoom) {
                            if (err) {
                                console.log('Error in finding chat room');
                                return;
                            }

                            if (chatRoom) {
                                // create a new chat message
                                chatRoomId = chatRoom.chatRoomId;
                                Chat.create(
                                    {
                                        sender: data.sender,
                                        receiver: data.receiver,
                                        message: data.message,
                                        chatRoomId: chatRoomId,
                                    },
                                    function (err, chat) {
                                        if (err) {
                                            console.log(
                                                'Error in creating chat message',
                                                err
                                            );
                                            return;
                                        }

                                        // find the chat room and push the message
                                        ChatRoom.findOneAndUpdate(
                                            {
                                                chatRoomId: chatRoomId,
                                            },
                                            {
                                                $push: {
                                                    messages: chat._id,
                                                },
                                            },
                                            function (err, chatRoom) {  
                                                if (err) {
                                                    console.log( 
                                                        'Error in finding chat room'
                                                    );
                                                    return;
                                                }

                                                

                                                return res.status(200).json({
                                                    message: 'Chat message created',
                                                    data: {
                                                        chat: chat,
                                                    },
                                                });
                                            }); 
                                    }
                                );
                            }
                            return;
                        }
                    );
                }
            }
        );
    } catch (error) {
        console.log('Error', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
};
