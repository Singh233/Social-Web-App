class ChatEngine{
    constructor(chatBoxId, userEmail, userName, userProfile){
        this.chatBox = $(`#${chatBoxId}`);
        this.userEmail = userEmail;
        this.userName = userName;
        this.userProfile = userProfile;

        // this.socket = io.connect('https://54.91.2.241:5000', {
        this.socket = io.connect('http://192.168.0.3:4000', {
                transports: ["websocket"],
            secure:true,
            reconnect: true,
            rejectUnauthorized : false
        });

        if (this.userEmail){
            this.connectionHandler();
        }

    }


    connectionHandler(){
        let self = this;
        this.socket.on('connect', function(){
            console.log('connection established using sockets...!');

            self.socket.emit('join_room', {
                user_email: self.userEmail,
                user_name: self.userName,
                user_profile: self.userProfile,
                time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                chatroom: 'codeial',
            });


            self.socket.on('user_joined', function(data) {
                console.log('a user joined!', data);
            })
        });


        // send a message on clicking the send message button
        $('#send-message').click(function(){
            let msg = $('#chat-message-input').val();

            if (msg != ''){
                self.socket.emit('send_message', {
                    message: msg,
                    user_email: self.userEmail,
                    user_name: self.userName,
                    user_profile: self.userProfile,
                    time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: "numeric", minute: "numeric"}),
                    chatroom: 'codeial'
                });
            }
        });

        self.socket.on('receive_message', function(data){
            console.log('message received', data.message);


            let newMessage = $('<li>');
            let profile = $('<img>');
            
            newMessage.addClass('animate__animated  animate__bounceInUp');
            let messageType = 'other-message animate__animated  animate__bounceInLeft';

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


            

            newMessage.append($('<sub>', {
                'html': data.user_name
            }));

            newMessage.addClass(messageType);

            $('#chat-messages-list').append(newMessage);
            $('#chat-message-input').val('');
        });
    }
}