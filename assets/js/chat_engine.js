class ChatEngine{
    
    constructor(chatBoxId, userId, userEmail, userName, userProfile, host){
        this.chatBox = $(`#${chatBoxId}`);
        this.userEmail = userEmail;
        this.userId = userId;
        this.userName = userName;
        this.userProfile = userProfile;
        
        // this.socket = io.connect('https://54.91.2.241:5000', {
        this.socket = io.connect(host, {
            transports: ["websocket"],
            secure:true,
            reconnect: true,
            rejectUnauthorized : false,
            query: {
                userId: this.userId,
            }
        });

        // chat rooms array
        this.chatRooms = ['Global'];

        if (this.userEmail){
            this.connectionHandler();
        }

    }


    connectionHandler(){

        let self = this;
        this.socket.on('connect', function(){
            // console.log('connection established using sockets...!');
            // join private chat room
            // self.socket.emit('join_private_room', {
            //     user_email: self.userEmail,
            //     user_name: self.userName,
            //     user_profile: self.userProfile,
            //     time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
            //     chatroom: 'Private',
            // });
            self.socket.emit('user_online', {
                user_id: self.userId,
            })
        });

        self.socket.on('connections', function(data) {
            $('#active-users').html('<i class="fa-solid fa-circle"></i> ' + (data.count - 1) + ' Online');
        })

        self.socket.on('update_status', function(data) {
            // check if the there's list exist with id as id using jquery
            if (!data.map) {
                return;
            }
            // iterate over the map and update the status of the user
            data.map.forEach(function(value, key) {
                let statusElement = $(`#status-${value.userId}`);
                if (value.status === 'online' && statusElement.length > 0) {
                    statusElement.html('<i class="fa-solid fa-circle"></i> Active Now');
                } else if (statusElement.length > 0) {
                    // console.log(value);
                    // show last seen time using moment library
                    if (value.moment) {
                    statusElement.html('Active ' + value.moment);
                    } else {
                    statusElement.html('offline');
                    }
                }
            });
            
        })

        // update status of user
        // self.socket.on('status_updated', function(data) {
        //     // console.log("status updated", data);
        //     if (data.status == 'online'){
        //         $(`#status-${data.user_id}`).html('<i class="fa-solid fa-circle"></i> Online');
        //     } else {
        //         $(`#status-${data.user_id}`).html('<i class="fa-solid fa-circle"></i> Offline');
        //     }
        // });

        // connect socket on global chat button click
        $('#global-chat-btn').click(function(){
            // join global chat room
            self.socket.emit('join_global_room', {
                user_email: self.userEmail,
                user_name: self.userName,
                user_profile: self.userProfile,
                time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                from_user: self.userId,
                chatroom: 'Global',
            });

            // display notification
            toast("Global Chat joined!", "success");
            $(`#chat-messages-list-global`).parent().find('#messages-loader').removeClass('hide-loader');

        });

        self.socket.on('global_user_joined', async function(data) {
            // console.log('a user joined!', data);

            const response = await fetch(`/api/v1/chat/global/${data.from_user}/all`);
            const responseData = await response.json();
            $(`#chat-messages-list-global`).parent().find('#messages-loader').addClass('hide-loader');

            // if chat messages private list is empty, then add the messages to the list
            if ($(`#chat-messages-list-global`).children().length == 0){
                responseData.data.chatRoom.messages.forEach(function(message){
                    addGlobalChatToDOM(message);
                });
            }

            scrollToBottom();
        })

        // connect socket on one of the user's private chat button click
        $('.friend').click(function(){
            // get the friend's email id using the id of the clicked button
            let to_user = $(this).attr('id');
            let from_user = self.userId;
            let chatRoom = to_user + from_user;


            // join private chat room
            self.socket.emit('join_private_room', {
                user_email: self.userEmail,
                user_name: self.userName,
                user_profile: self.userProfile,
                time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                from_user,
                to_user,
                chatroom: chatRoom,
            });

            // clear the chat box if the user clicks on a different friend
            if (document.getElementById('chat-user-id').value == to_user){
                // console.log('inside if')
                $(`#chat-messages-list-private-${to_user}`).children().remove();
            }
            $(`#chat-messages-list-private-${to_user}`).parent().find('#messages-loader').removeClass('hide-loader');

            
        });

        self.socket.on('private_user_joined', async function(data) {
            // console.log('a user joined!', data);
            // show loader while fetching the messages

            const response = await fetch(`/api/v1/chat/private/${data.from_user}/${data.to_user}`);
            const responseData = await response.json();

            // hide loader after fetching the messages
            $(`#chat-messages-list-private-${data.to_user}`).parent().find('#messages-loader').addClass('hide-loader');

            // if chat messages private list is empty, then add the messages to the list
            if ($(`#chat-messages-list-private-${data.from_user}`).children().length == 0){
                responseData.data.chatRoom.messages.forEach(function(message){
                    addChatToDOM(message);
                });
            }

            scrollToBottomPrivate();

        })


        // send a message on clicking the send message button or pressing enter
        $('#send-message-global').click(function(){
            let msg = $('#chat-message-input-global').val();

            if (msg != ''){
                const chatroom = document.getElementById('chat-room-').innerText;
                // console.log(chatroom)
                if (chatroom == 'Global Chat'){
                    // send message to the server
                    self.socket.emit('send_global_message', {
                        message: msg,
                        user_email: self.userEmail,
                        user_name: self.userName,
                        user_profile: self.userProfile,
                        time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                        from_user: self.userId,
                        chatroom: 'Global'
                    });

                    const response = fetch(`/api/v1/chat/createmessage/${msg}/${self.userId}/all`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    }).then(function(response){
                        return response.json();
                    }).then(function(data){
                        // console.log(data);
                    }).catch(function(err){
                        // console.log(err);
                        showToast('error', 'Error sending message!', 3000, '');
                    });
                } 
            }
        });

        $('#send-message-private').click(function(){
            let msg = $('#chat-message-input-private').val();

            if (msg != ''){
                const to_user = document.getElementById('chat-user-id').value;
                const from_user = self.userId;
                let chatRoom = to_user + from_user;

                // send message to the server
                self.socket.emit('send_private_message', {
                    message: msg,
                    user_email: self.userEmail,
                    user_name: self.userName,
                    user_profile: self.userProfile,
                    time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                    from_user,
                    to_user,
                    chatroom: chatRoom
                });

                const response = fetch(`/api/v1/chat/createmessage/${msg}/${from_user}/${to_user}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                }).then(function(response){
                    return response.json();
                }).then(function(data){
                    // console.log(data);
                }).catch(function(err){
                    // console.log(err);
                    showToast('error', 'Error sending message!', 3000, '');
                });

            }
        });

                

        // send a message on pressing enter
        $('#chat-message-input-global').keypress(function(e){
            if (e.which == 13){
                $('#send-message-global').click();
            }
        });
        $('#chat-message-input-private').keypress(function(e){
            if (e.which == 13){
                $('#send-message-private').click();
            }
        });


        self.socket.on('receive_notification', function(data) {
            // console.log('notification received', data);
            if ($('#user-messages-private').hasClass('remove') && self.userId == data.to_user){
                toast('New message from ' + data.user_name.split(' ')[0], 'success', 4000, 'https://img.freepik.com/free-icon/chat_318-561856.jpg?size=626&ext=jpg&uid=R38501345&ga=GA1.2.1154692012.1676455794&semt=ais');
                
            }
        })
        

        self.socket.on('receive_global_message', function(data){
            // console.log('message received', data.message);


            let newMessage = $('<li>');
            let profile = $('<img>');
            
            newMessage.addClass('animate__animated  animate__fadeIn');
            let messageType = 'other-message animate__animated  animate__fadeIn';

            if (data.user_email == self.userEmail){
                messageType = 'self-message';
                newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                <img src="${data.user_profile}">
                            </div>`);
            } else {
                newMessage.append(`<div class="msg-content">
                                <img src="${data.user_profile}">
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                
                            </div>`);
            }


            // check if the last message was sent by the same user
            if ($('#chat-messages-list-global li').length){
                let lastMessage = $('#chat-messages-list-global li:last-child');

                if (lastMessage.find('sub').html() == data.user_name){   
                    lastMessage.find('sub').remove();
                    // hide the visibility of the profile image
                    lastMessage.find('img').css('visibility', 'hidden');

                    // remove margin from the last self message
                    if (lastMessage.hasClass('self-message')){
                        lastMessage.css('margin-bottom', '0px');
                    } else {
                        lastMessage.css('margin-bottom', '0px');
                    }

                    // remove margin from the current message
                    newMessage.css('margin-top', '0px');
                }
            } 
            newMessage.append($('<sub>', {
                'html': data.user_name
            }));

            
            // console.log(newMessage)
            newMessage.addClass(messageType);

            $('#chat-messages-list-global').append(newMessage);
            $('#chat-message-input-global').val('');
            scrollToBottom();
        });

        self.socket.on('receive_private_message', function(data){
            // post the message to the database
            // show toast notification if the user is not in the chat window
            
            
            // console.log('message received', data.message);
            let userId = document.getElementById('chat-user-id').value;
            if (userId != data.from_user && userId != data.to_user){
                return;
            }
            // console.log(userId);
            let newMessage = $('<li>');
            let profile = $('<img>');
            
            newMessage.addClass('animate__animated  animate__fadeIn');
            let messageType = 'other-message animate__animated  animate__fadeIn';

            if (data.user_email == self.userEmail){
                messageType = 'self-message';
                newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                <img src="${data.user_profile}">
                            </div>`);
            } else {
                newMessage.append(`<div class="msg-content">
                                <img src="${data.user_profile}">
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                
                            </div>`);
            }

            // check if the last message was sent by the same user
            if ($(`#chat-messages-list-private-${userId} li`).length){
                let lastMessage = $(`#chat-messages-list-private-${userId} li:last-child`);

                if (lastMessage.find('sub').html() == data.user_name){   
                    lastMessage.find('sub').remove();
                    // hide the visibility of the profile image
                    lastMessage.find('img').css('visibility', 'hidden');

                    // remove margin from the last self message
                    if (lastMessage.hasClass('self-message')){
                        lastMessage.css('margin-bottom', '0px');
                    } else {
                        lastMessage.css('margin-bottom', '0px');
                    }

                    // remove margin from the current message
                    newMessage.css('margin-top', '0px');
                }
            } 
            newMessage.append($('<sub>', {
                'html': data.user_name
            }));

            

            newMessage.addClass(messageType);

            $(`#chat-messages-list-private-${userId}`).append(newMessage);
            $('#chat-message-input-private').val('');
            scrollToBottomPrivate();
        });

        function scrollToBottom(){
            let chatMessages = document.getElementById('chat-messages-list-global');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function scrollToBottomPrivate(){
            let userId = document.getElementById('chat-user-id').value;

            let chatMessages = document.getElementById('chat-messages-list-private-' + userId);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function addChatToDOM(data) {
            let userId = document.getElementById('chat-user-id').value;
            if (userId != data.sender._id && userId != data.receiver._id){
                return;
            }

            // console.log(userId);
            let newMessage = $('<li>');
            let profile = $('<img>');
            
            newMessage.addClass('animate__animated  animate__fadeIn');
            let messageType = 'other-message animate__animated  animate__fadeIn';
            
            if (data.sender.email == self.userEmail){
                messageType = 'self-message';
                newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${new Date(data.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"})}</sup> 
                                </span>
                                <img src="${data.sender.avatar ? data.sender.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'}">
                                
                            </div>`);
            } else {
                newMessage.append(`<div class="msg-content">
                                <img src="${data.sender.avatar ? data.sender.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'}">
                                <span>
                                    ${data.message} <sup>${new Date(data.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"})}</sup> 
                                </span>
                                
                            </div>`);
            }

            // check if the last message was sent by the same user
            if ($(`#chat-messages-list-private-${userId} li`).length){
                let lastMessage = $(`#chat-messages-list-private-${userId} li:last-child`);

                if (lastMessage.find('sub').html() == data.sender.name){   
                    lastMessage.find('sub').remove();
                    // hide the visibility of the profile image
                    lastMessage.find('img').css('visibility', 'hidden');

                    // remove margin from the last self message
                    if (lastMessage.hasClass('self-message')){
                        lastMessage.css('margin-bottom', '0px');
                    } else {
                        lastMessage.css('margin-bottom', '0px');
                    }

                    // remove margin from the current message
                    newMessage.css('margin-top', '0px');
                }
            } 
            newMessage.append($('<sub>', {
                'html': data.sender.name
            }));

            

            newMessage.addClass(messageType);

            $(`#chat-messages-list-private-${userId}`).append(newMessage);
            $('#chat-message-input-private').val('');
        }

        function addGlobalChatToDOM(data) {
            
            let newMessage = $('<li>');
            let profile = $('<img>');
            
            newMessage.addClass('animate__animated  animate__fadeIn');
            let messageType = 'other-message animate__animated  animate__fadeIn';

            if (data.sender.email == self.userEmail){
                messageType = 'self-message';
                newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${new Date(data.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"})}</sup> 
                                </span>
                                <img src="${data.sender.avatar ? data.sender.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'}">
                            </div>`);
            } else {
                newMessage.append(`<div class="msg-content">
                                <img src="${data.sender.avatar ? data.sender.avatar : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'}">

                                <span>
                                    ${data.message} <sup>${new Date(data.createdAt).toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"})}</sup> 
                                </span>
                                
                            </div>`);
            }


            // check if the last message was sent by the same user
            if ($('#chat-messages-list-global li').length){
                let lastMessage = $('#chat-messages-list-global li:last-child');

                if (lastMessage.find('sub').html() == data.sender.name){   
                    lastMessage.find('sub').remove();
                    // hide the visibility of the profile image
                    lastMessage.find('img').css('visibility', 'hidden');

                    // remove margin from the last self message
                    if (lastMessage.hasClass('self-message')){
                        lastMessage.css('margin-bottom', '0px');
                    } else {
                        lastMessage.css('margin-bottom', '0px');
                    }

                    // remove margin from the current message
                    newMessage.css('margin-top', '0px');
                }
            } 
            newMessage.append($('<sub>', {
                'html': data.sender.name
            }));

            
            // console.log(newMessage)
            newMessage.addClass(messageType);

            $('#chat-messages-list-global').append(newMessage);
            $('#chat-message-input-global').val('');
        }

        function toast(message, type, duration, icon) {
            
                
            if (type == 'error'){
                if (!icon){
                    icon = 'https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9'
                }

                Toastify({
                    text: "<%= flash.error %>",
                    duration: duration,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: icon,
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#D20A0A",
                        borderRadius: "10px",
                        color: "white",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            } else if (type == 'success'){
                if (!icon){
                    icon = "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d"
                }
                Toastify({
                    text: message,
                    duration: duration,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: icon,

                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#202020",
                        borderRadius: "10px",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            }
        }


        
    }
}