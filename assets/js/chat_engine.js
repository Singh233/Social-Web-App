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
            userId,
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
            console.log('connection established using sockets...!');
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
                    statusElement.html('<i class="fa-solid fa-circle"></i> Offline');
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
                chatroom: 'Global',
            });

            self.socket.on('user_joined', function(data) {
                // console.log('a user joined!', data);
            })

        });

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

            self.socket.on('user_joined', function(data) {
                // console.log('a user joined!', data);
            })

            // clear the chat box if the user clicks on a different friend
            if (document.getElementById('chat-user-id').value == to_user){
                // console.log('inside if')
                $(`#chat-messages-list-private-${to_user}`).children().remove();
            }
        });


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
                        chatroom: 'Global'
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
        });

        self.socket.on('receive_private_message', function(data){
            // console.log('message received', data.message);
            let userId = document.getElementById('chat-user-id').value;

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
        });
    }
}