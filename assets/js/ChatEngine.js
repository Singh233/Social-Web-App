/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
class ChatEngine {
  constructor(chatBoxId, userId, userEmail, userName, userProfile, host) {
    this.chatBox = $(`#${chatBoxId}`);
    this.userEmail = userEmail;
    this.userId = userId;
    this.userName = userName;
    this.userProfile = userProfile;

    // this.socket = io.connect('https://54.91.2.241:5000', {
    this.socket = io.connect(host, {
      transports: ["websocket"],
      secure: true,
      reconnect: true,
      rejectUnauthorized: false,
      query: {
        userId: this.userId,
      },
    });

    // chat rooms array
    this.chatRooms = ["Global"];

    if (this.userEmail) {
      this.chatConnectionHandler();
    }
  }

  chatConnectionHandler() {
    const self = this;
    this.socket.on("connect", function () {
      // console.log('connection established using sockets...!');
      self.socket.emit("user_online", {
        user_id: self.userId,
      });
    });

    self.socket.on("connections", function (data) {
      $("#active-users").html(
        `<i class="fa-solid fa-circle"></i> ${data.count - 1} Online`
      );
    });

    self.socket.on("update_status", function (data) {
      // check if the there's list exist with id as id using jquery
      if (!data.map) {
        return;
      }
      // iterate over the map and update the status of the user
      data.map.forEach(function (value, key) {
        const statusElement = $(`#status-${value.userId}`);
        const hiddenStatusElement = $(`#hidden-status-${value.userId}`);
        if (value.userId === self.userId) {
          return;
        }
        if (value.status === "Active now") {
          if (statusElement) {
            statusElement.html("Active now");
          }
          hiddenStatusElement.html("Active now");
          $(`#status-icon-${value.userId}`).addClass("user-active");

          if ($("#chat-room-private-status").hasClass(value.userId)) {
            $("#chat-room-private-status-icon").removeClass("offline-color");
            $("#chat-room-private-status-text").html("Active now");
          }

          // $(`#message-icon-${value.userId}`).removeClass("remove");
          // $(`#circle-icon-${value.userId}`).addClass("remove");
          // $(`#last-message-time-${value.userId}`).addClass("remove");
        } else {
          // console.log(value);
          // show last seen time using moment library
          $(`#status-icon-${value.userId}`).removeClass("user-active");

          if ($("#chat-room-private-status").hasClass(value.userId)) {
            $("#chat-room-private-status-icon").addClass("offline-color");
            $("#chat-room-private-status-text").html(
              value.moment ? `Active ${value.moment}` : "offline"
            );
          }

          if (value.moment) {
            if (statusElement) {
              statusElement.html(`Active ${value.moment}`);
            }
            hiddenStatusElement.html(`Active ${value.moment}`);
          } else {
            if (statusElement) {
              statusElement.html("offline");
            }
            hiddenStatusElement.html("offline");
          }
        }
      });
    });

    // connect socket on global chat button click
    $("#global-chat-btn").click(function () {
      // join global chat room
      self.socket.emit("join_global_room", {
        user_email: self.userEmail,
        user_name: self.userName,
        user_profile: self.userProfile,
        time: new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        }),
        from_user: self.userId,
        chatroom: "Global",
      });

      // display notification
      toast("Global Chat joined!", "success");
      $(`#chat-messages-list-global`)
        .parent()
        .find("#messages-loader")
        .removeClass("hide-loader");
    });

    self.socket.on("global_user_joined", async function (data) {
      // console.log('a user joined!', data);

      const response = await fetch(
        `/api/v1/chat/global/${data.from_user}/all/global`
      );
      const responseData = await response.json();
      $(`#chat-messages-list-global`)
        .parent()
        .find("#messages-loader")
        .addClass("hide-loader");

      // if chat messages private list is empty, then add the messages to the list
      if ($(`#chat-messages-list-global`).children().length === 0) {
        responseData.data.chatRoom.messages.forEach(function (message) {
          addGlobalChatToDOM(message);
        });
      }

      scrollToBottom();
    });

    // connect socket on one of the user's private chat button click
    $(".friend").click(function () {
      // get the friend's email id using the id of the clicked button
      const to_user = $(this).attr("id");
      const from_user = self.userId;
      const chatRoom = $(this).attr("data-chatRoomId");
      CALL_ROOM_ID = chatRoom;
      // join private chat room
      self.socket.emit("join_private_room", {
        user_email: self.userEmail,
        user_name: self.userName,
        user_profile: self.userProfile,
        time: new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        }),
        from_user,
        to_user,
        chatroom: chatRoom,
      });
    });

    // listen to keypress event on the chat message input private and show the typing status
    $("#chat-message-input-private").keypress(function (event) {
      const to_user = document.getElementById("chat-user-id").value;
      const from_user = self.userId;
      const chatRoom = document.getElementById("chatroom-id").value;

      // if key is not enter key
      if (event.which !== 13) {
        self.socket.emit("typingPrivate", {
          user_email: self.userEmail,
          user_name: self.userName,
          user_profile: self.userProfile,
          time: new Date().toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          }),
          from_user,
          to_user,

          chatroom: chatRoom,
        });
      }
    });

    let typing = false;
    let timeout = null;
    let animationTimeout = null;

    function timeoutFunction() {
      typing = false;
      $("#typing-status-private").addClass("animate__fadeOut");
      animationTimeout = setTimeout(function () {
        $("#typing-status-private").html("");
      }, 400);
    }

    // listen to typing event and show the typing status
    self.socket.on("typingResponsePrivate", function (data) {
      // console.log(data)
      // console.log('typing')
      const to_user = document.getElementById("chat-user-id").value;
      const chatRoomId = document.getElementById("chatroom-id").value;
      const from_user = self.userId;

      if (data.chatroom === chatRoomId || data.chatroom === chatRoomId) {
        if (data.from_user !== from_user) {
          if (typing === false) {
            clearTimeout(animationTimeout);
            $("#typing-status-private").removeClass("animate__fadeOut");

            typing = true;
            const element = $("#typing-status-private").html(`
                            <img class='animate__animated animate__fadeIn' src="${data.user_profile}">
                            <div class="animation animate__animated animate__fadeIn">
                                <div class="animation__dot1"></div>
                                <div class="animation__dot2"></div>
                                <div class="animation__dot3"></div>
                            </div>
                        `);

            // console.log('typed')
            timeout = setTimeout(timeoutFunction, 1000);
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 1000);
          }
        }
      }
    });

    // listen to keypress event on the chat message input global and show the typing status
    $("#chat-message-input-global").keypress(function (event) {
      const from_user = self.userId;

      // if key is not enter key
      if (event.which !== 13) {
        self.socket.emit("typingGlobal", {
          user_email: self.userEmail,
          user_name: self.userName,
          user_profile: self.userProfile,
          time: new Date().toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          }),
          from_user,
          chatroom: "Global",
        });
      }
    });

    let typingGlobal = false;
    let timeoutGlobal = undefined;
    let animationTimeoutGlobal = undefined;

    function timeoutFunctionGlobal() {
      typingGlobal = false;
      $("#typing-status-global").addClass("animate__fadeOut");
      animationTimeoutGlobal = setTimeout(function () {
        $("#typing-status-global").html("");
      }, 400);
    }

    // listen to typing event and show the typing status
    self.socket.on("typingResponseGlobal", function (data) {
      // console.log(data)
      // console.log('typing')
      const from_user = self.userId;

      if (data.chatroom === "Global") {
        if (data.from_user !== from_user) {
          if (typingGlobal === false) {
            clearTimeout(animationTimeoutGlobal);
            $("#typing-status-global").removeClass("animate__fadeOut");

            typingGlobal = true;
            const element = $("#typing-status-global").html(`
                            <img class='animate__animated animate__fadeIn' src="${data.user_profile}">
                            <div class="animation animate__animated animate__fadeIn">
                                <div class="animation__dot1"></div>
                                <div class="animation__dot2"></div>
                                <div class="animation__dot3"></div>
                            </div>
                        `);

            // append the typing status to the chat messages list
            $("#chat-messages-list-global").append(element);

            // console.log('typed')
            timeoutGlobal = setTimeout(timeoutFunctionGlobal, 1000);
          } else {
            clearTimeout(timeoutGlobal);
            timeoutGlobal = setTimeout(timeoutFunctionGlobal, 1000);
          }
        }
      }
    });

    // send a message on clicking the send message button or pressing enter
    $("#send-message-global").click(function () {
      let msg = $("#chat-message-input-global").val();

      if (msg === "") {
        return;
      }
      const chatroom = document.getElementById("chat-room-").innerText;
      // console.log(chatroom)
      if (chatroom === "Global Chat") {
        // send message to the server
        self.socket.emit("send_global_message", {
          message: msg,
          user_email: self.userEmail,
          user_name: self.userName,
          user_profile: self.userProfile,
          time: new Date().toLocaleTimeString("en-US", {
            hour12: true,
            hour: "numeric",
            minute: "numeric",
          }),
          from_user: self.userId,
          chatroom: "Global",
        });

        fetch(
          `/api/v1/chat/createmessage/${msg}/global/${self.userId}/all/global`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        )
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            // console.log(data);
          })
          .catch(function (err) {
            // console.log(err);
            showToast("error", "Error sending message!", 3000, "");
          });
      }
    });

    $("#send-message-private").click(function () {
      let msg = $("#chat-message-input-private").val();

      if (msg === "") {
        return;
      }

      const to_user = document.getElementById("chat-user-id").value;
      const from_user = self.userId;
      let chatRoom = document.getElementById("chatroom-id").value;

      // send message to the server
      self.socket.emit("send_private_message", {
        message: msg,
        user_email: self.userEmail,
        user_name: self.userName,
        user_profile: self.userProfile,
        time: new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        }),
        from_user,
        to_user,
        chatroom: chatRoom,
      });

      fetch(
        `/api/v1/chat/createmessage/${msg}/private/${from_user}/${to_user}/${chatRoom}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          // console.log(data);
        })
        .catch(function (err) {
          // console.log(err);
          showToast("error", "Error sending message!", 3000, "");
        });
    });

    // send a message on pressing enter
    $("#chat-message-input-global").keypress(function (e) {
      if (e.which == 13) {
        $("#send-message-global").click();
      }
    });
    $("#chat-message-input-private").keypress(function (e) {
      if (e.which == 13) {
        $("#send-message-private").click();
      }
    });

    self.socket.on("receive_global_message", function (data) {
      // console.log('message received', data.message);

      let newMessage = $("<li>");
      let profile = $("<img>");

      newMessage.addClass("animate__animated  animate__fadeIn");
      let messageType = "other-message animate__animated  animate__fadeIn";

      if (data.user_email == self.userEmail) {
        messageType = "self-message";
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
      if ($("#chat-messages-list-global li").length) {
        let lastMessage = $("#chat-messages-list-global li:last-child");

        if (lastMessage.find("sub").html() == data.user_name) {
          lastMessage.find("sub").remove();
          // hide the visibility of the profile image
          lastMessage.find("img").css("visibility", "hidden");

          // remove margin from the last self message
          if (lastMessage.hasClass("self-message")) {
            lastMessage.css("margin-bottom", "0px");
          } else {
            lastMessage.css("margin-bottom", "0px");
          }

          // remove margin from the current message
          newMessage.css("margin-top", "0px");
        }
      }
      newMessage.append(
        $("<sub>", {
          html: data.user_name,
        })
      );

      // console.log(newMessage)
      newMessage.addClass(messageType);

      $("#chat-messages-list-global").append(newMessage);
      $("#chat-message-input-global").val("");
      scrollToBottom();
    });

    // listen to incoming notifications(message from other users)
    self.socket.on("receive_notification", function (data) {
      // add message to friend chatroom
      if (
        $("#user-messages-private").hasClass("remove") &&
        self.userId === data.to_user
      ) {
        toast(
          `New message from ${data.user_name.split(" ")[0]}`,
          "success",
          4000,
          "https://img.freepik.com/free-icon/chat_318-561856.jpg?size=626&ext=jpg&uid=R38501345&ga=GA1.2.1154692012.1676455794&semt=ais"
        );
      }
      const timestamp = new Date().toISOString();
      let toUser = null;
      let flag = true;
      if (self.userEmail === data.user_email) {
        toUser = data.to_user;
        flag = false;
      } else {
        toUser = data.user_email;
      }
      // eslint-disable-next-line no-param-reassign, no-unused-expressions
      friends &&
        friends.map((friend) => {
          let checkFriend = friend._id;
          if (flag) {
            checkFriend = friend.email;
          }

          if (checkFriend === toUser) {
            friend.chatRoom.messages.push({
              sender: {
                _id: data.from_user,
                avatar: data.user_profile,
                name: data.user_name,
                email: data.user_email,
              },
              receiver: {
                _id: data.to_user,
              },
              message: `${data.message}`,
              messageType: `${data.messageType ? data.messageType : "text"}`,
              createdAt: timestamp,
            });

            friend.chatRoom.lastMessage = {
              from_user: {
                _id: data.from_user,
                avatar: data.user_profile,
                name: data.user_name,
                email: data.user_email,
              },
              message: data.message,
              messageType: `${data.messageType ? data.messageType : "text"}`,
              timestamp: timestamp,
            };

            // if current user is sender
            if (flag) {
              $(`#lastmessage-${data.from_user}`).text(`${data.message}`);
              $(`#status-${data.from_user}`).text(`${data.message}`);
              $(`#last-message-time-${data.from_user}`).text(`${data.time}`);
            } else {
              $(`#lastmessage-${data.to_user}`).text(`${data.message}`);
              $(`#status-${data.to_user}`).text(`${data.message}`);
              $(`#last-message-time-${data.to_user}`).text(`${data.time}`);
            }
          }
        });

      const compareByCreatedAt = (a, b) => {
        // Convert createdAt strings to Date objects
        const timeA = a.chatRoom.lastMessage
          ? a.chatRoom.lastMessage.timestamp
          : `2000-05-11T18:05:57.632Z`;
        const timeB = b.chatRoom.lastMessage
          ? b.chatRoom.lastMessage.timestamp
          : `2000-05-11T18:05:57.632Z`;

        const dateA = new Date(timeA);
        const dateB = new Date(timeB);

        // Compare the dates
        if (dateA > dateB) {
          return -1;
        }
        if (dateA < dateB) {
          return 1;
        }
        return 0;
      };
      friends && friends.sort(compareByCreatedAt);

      // console.log("message received", data);
      let userId = document.getElementById("chat-user-id").value;
      if (userId !== data.from_user && userId !== data.to_user) {
        return;
      }
      // console.log(userId);
      let newMessage = $("<li>");
      let profile = $("<img>");

      newMessage.addClass("animate__animated  animate__fadeIn");
      let senderType = "other-message animate__animated  animate__fadeIn";

      if (data.user_email === self.userEmail) {
        senderType = "self-message";
        newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                ${
                                  data.messageType &&
                                  data.messageType === "call"
                                    ? `<i class="fa-solid fa-video"></i>`
                                    : ""
                                }
                                
                            </div>`);
      } else {
        newMessage.append(`<div class="msg-content">
                                ${
                                  data.messageType &&
                                  data.messageType === "call"
                                    ? `<i class="fa-solid fa-video"></i>`
                                    : ""
                                }
                                <span>
                                    ${data.message} <sup>${data.time}</sup> 
                                </span>
                                
                            </div>`);
      }

      // check if the last message was sent by the same user
      if ($(`#chat-messages-list-private-${userId} li`).length) {
        let lastMessage = $(
          `#chat-messages-list-private-${userId} li:last-child`
        );

        if (lastMessage.find("img").attr("src") === data.user_profile) {
          lastMessage.find("sub").remove();
          // hide the visibility of the profile image
          lastMessage.find("img").css("visibility", "hidden");

          // remove margin from the last self message
          if (lastMessage.hasClass("self-message")) {
            lastMessage.css("margin-bottom", "0px");
          } else {
            lastMessage.css("margin-bottom", "0px");
          }

          // remove margin from the current message
          newMessage.css("margin-top", "0px");
        }
      }
      // newMessage.append($('<sub>', {
      //     'html': data.user_name
      // }));

      newMessage.addClass(senderType);

      $(`#chat-messages-list-private-${userId}`).append(newMessage);
      $("#chat-message-input-private").val("");
      scrollToBottomPrivate();
    });

    function scrollToBottom() {
      let chatMessages = document.getElementById("chat-messages-list-global");
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function scrollToBottomPrivate() {
      let userId = document.getElementById("chat-user-id").value;

      let chatMessages = document.getElementById(
        "chat-messages-list-private-" + userId
      );
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addGlobalChatToDOM(data) {
      let newMessage = $("<li>");
      let profile = $("<img>");

      newMessage.addClass("animate__animated  animate__fadeIn");
      let messageType = "other-message animate__animated  animate__fadeIn";

      if (data.sender.email == self.userEmail) {
        messageType = "self-message";
        newMessage.append(`<div class="msg-content">
                                <span>
                                    ${data.message} <sup>${new Date(
          data.createdAt
        ).toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        })}</sup> 
                                </span>
                                <img src="${
                                  data.sender.avatar
                                    ? data.sender.avatar
                                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                                }">
                            </div>`);
      } else {
        newMessage.append(`<div class="msg-content">
                                <img src="${
                                  data.sender.avatar
                                    ? data.sender.avatar
                                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"
                                }">

                                <span>
                                    ${data.message} <sup>${new Date(
          data.createdAt
        ).toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
        })}</sup> 
                                </span>
                                
                            </div>`);
      }

      // check if the last message was sent by the same user
      if ($("#chat-messages-list-global li").length) {
        let lastMessage = $("#chat-messages-list-global li:last-child");

        if (lastMessage.find("sub").html() == data.sender.name) {
          lastMessage.find("sub").remove();
          // hide the visibility of the profile image
          lastMessage.find("img").css("visibility", "hidden");

          // remove margin from the last self message
          if (lastMessage.hasClass("self-message")) {
            lastMessage.css("margin-bottom", "0px");
          } else {
            lastMessage.css("margin-bottom", "0px");
          }

          // remove margin from the current message
          newMessage.css("margin-top", "0px");
        }
      }
      newMessage.append(
        $("<sub>", {
          html: data.sender.name,
        })
      );

      // console.log(newMessage)
      newMessage.addClass(messageType);

      $("#chat-messages-list-global").append(newMessage);
      $("#chat-message-input-global").val("");
    }

    function toast(message, type, duration, icon) {
      if (type == "error") {
        if (!icon) {
          icon =
            "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9";
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
          onClick: function () {}, // Callback after click
        }).showToast();
      } else if (type === "success") {
        if (!icon) {
          icon =
            "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d";
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
          onClick: function () {}, // Callback after click
        }).showToast();
      }
    }
  }
}

class CallEngine extends ChatEngine {
  constructor(chatBoxId, userId, userEmail, userName, userProfile, host) {
    super(chatBoxId, userId, userEmail, userName, userProfile, host);

    this.callConnectionHandler();
    this.peerId = null;
    this.mediaStream = null;

    // current caller object
    this.callee = {
      toUser: null,
      fromUser: null,
      userName: "",
      userAvatar: "",
      callRoomId: "",
    };

    // dom elements for video
    this.myVideo = document.querySelector(".caller-video");
    this.receiverVideo = document.querySelector(".receiver-video");
    this.myVideo.muted = true;

    this.peers = {};
    this.toUser = null;
    this.isInCall = false;
  }

  callConnectionHandler() {
    const self = this;
    const callModal = document.querySelector(".call-container");

    const myPeer = new Peer(undefined, {
      host: "/",
      port: "3001",
    });

    myPeer.on("open", function (id) {
      self.peerId = id;
    });

    self.handleCallActionsButtonClick(self);

    self.handleCallMinimise(self);
    self.handleCallMaximise(self);

    $("#user-video-button, #call-again-button").click(async function () {
      const userVideoButton = $("#user-video-button");
      if ($(userVideoButton).attr("disabled")) {
        return;
      }

      self.openCallModal(callModal, true);

      // set reciever name and avatar
      const parent = $(userVideoButton).parent();
      let img = "";
      let name = parent.find("#chat-room-private-username").text();
      let toUser = "";
      const fromUser = self.userId;

      // if parent is not null this means user is manually calling by visiting inside user chats
      if (name !== "Private Chat") {
        img = parent.find("img").attr("src");
        name = parent.find("#chat-room-private-username").text();
        toUser = document.getElementById("chat-user-id").value;
      } else {
        // else gather data from callee object
        img = self.callee.userAvatar;
        name = self.callee.userName;
        toUser = self.callee.fromUser;
      }
      // update details on call modal
      $(".incoming-outgoing-call-window").find("img").attr("src", img);
      $(".incoming-outgoing-call-window").find(".username").text(name);

      // update receiver card cover background image
      $(".receiver-card-cover").css({
        background: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.65) 0%,
        rgba(0, 0, 0, 0.65) 100%
      ),
      url("${img}") center / cover no-repeat`,
      });

      // hide call maximise button
      $(".call-expand-button").css({ display: "none" });

      self.toUser = toUser;

      // emit notification to user
      self.socket.emit("user_is_calling", {
        to_user: toUser,
        from_user: fromUser,
        user_name: self.userName,
        user_profile: self.userProfile,
        callRoomId: CALL_ROOM_ID,
        peerId: self.peerId,
      });
      // enable call exit icon
      $(".call-exit-icon").css({ display: "block" });
      // if user tries to reconnect
      if ($(this).attr("id") === "call-again-button") {
        // close current stream
        self.stopBothVideoAndAudio(self, self.mediaStream);
      }
      self.addOwnVideoStream(self, myPeer).then((stream) => {
        self.mediaStream = stream;
        self.initiateCall(self, myPeer);
      });
    });

    self.socket.on("user_is_calling_notification", (data) => {
      // if media stream is already active this means user is on another call or waiting to respond
      if (
        self.mediaStream &&
        self.mediaStream.active &&
        CALL_ROOM_ID !== data.callRoomId
      ) {
        self.socket.emit("user_on_another_call", {
          from_user: data.to_user,
          to_user: data.from_user,
        });
        return;
      }

      CALL_ROOM_ID = data.callRoomId;

      // update callee
      self.callee = {
        toUser: data.to_user,
        fromUser: data.from_user,
        userName: data.user_name,
        userAvatar: data.user_profile,
        callRoomId: data.callRoomId,
      };

      self.openCallModal(callModal, false);
      self.showIncomingCallToast(self);

      // set reciever name and avatar
      $(".incoming-outgoing-call-window")
        .find("img")
        .attr("src", data.user_profile);
      $(".incoming-outgoing-call-window")
        .find(".username")
        .text(data.user_name);

      // update receiver card cover background image
      $(".receiver-card-cover").css({
        background: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.65) 0%,
        rgba(0, 0, 0, 0.65) 100%
      ),
      url("${data.user_profile}") center / cover no-repeat`,
      });

      // disable call exit icon
      $(".call-exit-icon").css({ display: "none" });

      // show call maximise button
      $(".call-expand-button").css({ display: "block" });

      self.toUser = data.from_user;
      const fromUser = self.userId;

      self.otherUserPeerId = data.peerId;

      // if user tries to call again
      if (self.mediaStream && self.mediaStream.active) {
        // close current stream
        self.stopBothVideoAndAudio(self, self.mediaStream);
      }

      self.addOwnVideoStream(self).then((stream) => {
        self.mediaStream = stream;
        self.initiateCall(self, myPeer, data.peerId);
      });
    });

    self.socket.on("user_declined_call_notification", (data) => {
      self.updateCallModal("Call declined!", true);
    });

    self.socket.on("user_busy", (data) => {
      self.updateCallModal("Busy!", true);
    });

    self.socket.on("call_user_disconnected", (userId) => {
      if (this.peers[userId]) this.peers[userId].close();
      // update is in call variable
      self.isInCall = false;
    });
  }

  // Adds the user's own video stream
  addOwnVideoStream(self) {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((newStream) => {
          resolve(newStream);
        });
    });
  }

  initiateCall(self, myPeer, otherUserPeerId) {
    const stream = self.mediaStream;

    self.socket.emit("join_video_call", {
      callRoomId: CALL_ROOM_ID,
      peerId: self.peerId,
    });

    self.addVideoStream(self.myVideo, stream);

    myPeer.on("call", (call) => {
      if (stream && !stream.active) {
        return;
      }

      call.answer(stream);
      // remove outgoing/incoming call banner
      $(".outgoing-call").css({ display: "none" });
      $(".incoming-call").css({ display: "none" });

      // display header info
      $("#user-call-header").css({ display: "flex" });

      // enable call exit icon
      $(".call-exit-icon").css({ display: "block" });

      call.on("stream", (userVideoStream) => {
        // display receiver video
        $(".receiver-video").css({ display: "flex" });
        $(".receiver-card-cover").css({ display: "none" });
        self.addVideoStream(self.receiverVideo, userVideoStream);
        self.displayNotification("User joined!", 1000);
      });

      call.on("close", () => {
        $(".receiver-video").css({ display: "none" });
        $(".receiver-card-cover").css({ display: "flex" });
        // this.receiverVideo.remove();
      });
    });

    // handle answer call click
    $("#answer-call").click(() => {
      if (otherUserPeerId === self.peerId) {
        return;
      }

      // update is in call variable
      self.isInCall = true;

      // if button that cliced is on the toast then manually trigger call expand button
      $(".call-expand-button").trigger("click");

      // enable exit button
      $(".call-exit-icon").css({ display: "block" });

      // fire an event that the user answered call
      self.socket.emit("user_answered_call", {
        from_user: self.userId,
        to_user: self.toUser,
        fromUserPeerId: self.peerId,
      });
    });

    // handle reject call click
    $("#reject-call").click(() => {
      const callModal = document.querySelector(".call-container");
      self.closeCallModal(callModal, false);
      self.hideIncomingCallToast(self);
      // function to cancel incoming call
      self.cancelCall(self, stream);
    });

    // Event listener for other user call connected
    self.socket.on("call_user_connected", (data) => {
      self.otherUserPeerId = data.fromUserPeerId;
      self.connectToNewUser(data.fromUserPeerId, stream, myPeer);
      // update is in call variable
      self.isInCall = true;
    });

    // Event listeners when user toggle mic or camera
    self.socket.on("mic_toggled", (data) => {
      if (data.from_user === self.userId) {
        self.toggleAudioOnly(self, myPeer, stream, data.isDisabled);
        self.displayNotification(
          `${data.isDisabled ? "You are muted!" : "You are now unmuted!"}`,
          "success",
          2000
        );
        return;
      }
      if (!self.isInCall) {
        return;
      }
      if (data.isDisabled) {
        // update mic icon of connected user
        $("#is-mute").removeClass("fa-microphone");
        $("#is-mute").addClass("fa-microphone-slash");
        $("#is-mute").css({ padding: "10px 7.5px" });
        self.displayNotification(
          `${data.user_name && data.user_name.split(" ")[0]} is muted!`,
          "success",
          2000
        );
      } else {
        // update mic icon of connected user
        $("#is-mute").removeClass("fa-microphone-slash");
        $("#is-mute").addClass("fa-microphone");
        $("#is-mute").css({ padding: "10px 13px" });
        self.displayNotification(
          `${data.user_name && data.user_name.split(" ")[0]} is now unmuted!`,
          "success",
          2000
        );
      }
    });
    self.socket.on("camera_toggled", (data) => {
      if (data.from_user === self.userId) {
        self.toggleVideoOnly(self, myPeer, stream, data.isDisabled);
        self.displayNotification(
          `${
            data.isDisabled
              ? "Your video is hidden!"
              : "Your video is now visible!"
          }`,
          "success",
          2000
        );
        return;
      }
      if (!self.isInCall) {
        return;
      }
      if (data.isDisabled) {
        // update video icon of connected user
        $("#is-camera-disabled").removeClass("fa-video");
        $("#is-camera-disabled").addClass("fa-video-slash");
        self.displayNotification(
          `${
            data.user_name && data.user_name.split(" ")[0]
          } turned off their video!`,
          "success",
          2000
        );
      } else {
        // update video icon of connected user
        $("#is-camera-disabled").removeClass("fa-video-slash");
        $("#is-camera-disabled").addClass("fa-video");
        self.displayNotification(
          `${
            data.user_name && data.user_name.split(" ")[0]
          } turned on their video!`,
          "success",
          2000
        );
      }
    });

    // Event listener for when user leaves call
    self.socket.on("user_left_call", (data) => {
      if (data.from_user === self.userId) {
        self.stopBothVideoAndAudio(self, stream);
        self.displayNotification(`Call ended!`, "success", 2000);
      } else {
        self.updateCallModal(null, false);
        self.displayNotification(
          `${data.user_name && data.user_name.split(" ")[0]} ended call!`,
          "success",
          2000
        );
      }

      self.callCleanUp(self);
    });
  }

  endCall(self, stream) {
    // emit event to the connected user
    self.socket.emit("user_leaving_call", {
      from_user: self.userId,
      to_user: self.toUser,
      user_name: self.userName,
      user_profile: self.userAvatar,
      fromUserPeerId: self.peerId,
    });

    // Clean up any other resources associated with the call
    self.stopBothVideoAndAudio(self, stream);
    self.callCleanUp(self);

    self.isInCall = false;
  }

  cancelCall(self, stream) {
    // Emit event to other user
    self.socket.emit("user_declined_call", {
      from_user: self.userId,
      to_user: self.toUser,
      fromUserPeerId: self.peerId,
    });

    // Clean up video resources and connections
    self.stopBothVideoAndAudio(self, stream);
    self.callCleanUp(self);
  }

  handleCallActionsButtonClick(self) {
    const callModal = document.querySelector(".call-container");

    // handle mic icon click
    $("#mic-icon").click(function () {
      const isDisabled = $(this).hasClass("disabled");
      if (isDisabled) {
        $(this).removeClass("disabled");
        $(this).removeClass("fa-microphone-slash");
        $(this).addClass("fa-microphone");
        $(this).css({ padding: "10px 13px" });
      } else {
        $(this).css({ padding: "10px 7.5px" });
        $(this).addClass("disabled");
        $(this).removeClass("fa-microphone");
        $(this).addClass("fa-microphone-slash");
      }

      // emit event to self and connected user
      self.socket.emit("call_mic_toggle", {
        from_user: self.userId,
        to_user: self.toUser,
        user_name: self.userName,
        user_profile: self.userProfile,
        isDisabled: !isDisabled,
      });
    });

    // handle camera icon click
    $("#camera-icon").click(function () {
      const isDisabled = $(this).hasClass("disabled");
      if (isDisabled) {
        $(this).removeClass("disabled");
        $(this).removeClass("fa-video-slash");
        $(this).addClass("fa-video");
      } else {
        $(this).addClass("disabled");
        $(this).removeClass("fa-video");
        $(this).addClass("fa-video-slash");
      }
      // emit event to the connected user
      self.socket.emit("call_camera_toggle", {
        from_user: self.userId,
        to_user: self.toUser,
        user_name: self.userName,
        user_profile: self.userProfile,
        isDisabled: !isDisabled,
      });
    });

    // handle call exit click or close call
    $("#exit-call, #close-call-button").click(() => {
      const msg = self.isInCall ? "Call ended!" : "Missed call!";
      // send private message to user
      self.sendPrivateMessage(
        self,
        msg,
        self.userId,
        self.toUser,
        CALL_ROOM_ID
      );
      // close call modal
      self.closeCallModal(callModal, true);
      self.hideIncomingCallToast(self);

      // update is in call vaiable
      self.isInCall = false;

      // function to end current call
      self.endCall(self, self.mediaStream);
    });
  }

  // Adds a video stream to the video grid
  addVideoStream(video, stream) {
    video.srcObject = stream;

    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    video.removeEventListener("loadedmetadata", func);

    function func() {}
  }

  // Connects to a new user for a call
  connectToNewUser(userId, stream, myPeer) {
    const self = this;
    // if (self.peers[userId]) {
    //   return;
    // }

    // update calling status
    $(".call-status").text("");

    // remove outgoing/incoming call banner
    $(".outgoing-call").css({ display: "none" });
    $(".incoming-call").css({ display: "none" });

    // display header info
    $("#user-call-header").css({ display: "flex" });

    const call = myPeer.call(userId, stream);
    self.peers[userId] = call;

    call.on("stream", (userVideoStream) => {
      // display receiver video
      $(".receiver-video").css({ display: "flex" });
      $(".receiver-card-cover").css({ display: "none" });
      self.addVideoStream(self.receiverVideo, userVideoStream);
    });

    call.on("close", () => {
      $(".receiver-video").css({ display: "none" });
      $(".receiver-card-cover").css({ display: "flex" });
      // this.receiverVideo.remove();
    });
  }

  // stop both mic and camera
  stopBothVideoAndAudio(self, stream) {
    stream.getTracks().forEach((track) => {
      if (track.readyState === "live" || track.readyState === "ended") {
        track.stop();
      }
    });
  }

  // stop only camera
  toggleVideoOnly(self, myPeer, stream, isDisabled) {
    stream.getTracks().forEach(async (track) => {
      if (
        (track.readyState === "live" || track.readyState === "ended") &&
        track.kind === "video"
      ) {
        track.enabled = !isDisabled;
      }
    });

    // If the camera is being enabled, create a new call with the updated stream
  }

  // stop only mic
  toggleAudioOnly(self, myPeer, stream, isDisabled) {
    stream.getTracks().forEach(async (track) => {
      if (
        (track.readyState === "live" || track.readyState === "ended") &&
        track.kind === "audio"
      ) {
        track.enabled = !isDisabled;
      }
    });
  }

  callCleanUp(self) {
    $("#reject-call").unbind("click");
    $("#answer-call").unbind("click");
    // $("#mic-icon").unbind("click");

    // Unsubscribe from socket events
    self.socket.off("mic_toggled");
    self.socket.off("camera_toggled");
    self.socket.off("user_left_call");
    self.socket.off("call_user_connected");

    // remove event listener
    self.myVideo.removeEventListener("loadedmetadata", log());

    self.receiverVideo.removeEventListener("loadedmetadata", log());
    function log() {}
    self.closePeerConnection(self);
  }

  closePeerConnection(self) {
    if (self.peers[self.peerId]) self.peers[self.peerId].close();
    if (self.otherUserPeerId && self.peers[self.otherUserPeerId])
      self.peers[self.otherUserPeerId].close();
  }

  closeCallModal(callModal, isOutgoingCall) {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    // add fade out animation to call modal and incomingOutgoing call window
    $(callModal).removeClass("animate__fadeIn");
    $(callModal).addClass("animate__fadeOut");
    $(incomingOutgoingCallWindow).removeClass(
      "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
    );
    $(incomingOutgoingCallWindow).addClass("animate__fadeOut");
    // close call modal
    setTimeout(() => {
      callModal.style.display = "none";
    }, 700);

    // hide rejected call options
    $("#rejected-call-options").css({ display: "none" });

    // enable video call option
    $("#user-video-button").attr("disabled", false);
    // update icon
    $("#user-video-button").removeClass("fa-video-slash disabled-video-button");
    $("#user-video-button").addClass("fa-video");

    if (isOutgoingCall) {
      // reset header and video
      $("#user-call-header").css({ display: "none" });
      $(".receiver-video").css({ display: "none" });
      $(".receiver-card-cover").css({ display: "flex" });
    }
  }

  openCallModal(callModal, isOutgoingCall) {
    const userVideoButton = $("#user-video-button");
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    // disable button so no other call could be made
    $(userVideoButton).attr("disabled", true);
    // update icon
    $(userVideoButton).removeClass("fa-video");
    $(userVideoButton).addClass("fa-video-slash disabled-video-button");

    // remove animations from call modal and add fade in animation
    $(callModal).removeClass("animate__fadeOut animate__fadeIn");
    $(callModal).addClass("animate__fadeIn");

    if (isOutgoingCall) {
      // open call modal
      callModal.style.display = "flex";
      // remove animations from outgoing call banner and add fade in animation
      $(incomingOutgoingCallWindow).removeClass(
        "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
      );
      $(incomingOutgoingCallWindow).addClass("animate__fadeIn");
      $(".incoming-outgoing-call-window").css({ display: "flex" });

      // make the call in full window position
      $(".incoming-outgoing-call-window").addClass("call-maximised");
      // $(".call-maximise-button").trigger("click");

      // first hide if incoming call banner was opened
      const incomingCallBanner = document.querySelector(".incoming-call");
      incomingCallBanner.style.display = "none";

      // display outgoing call banner
      const outgoingCallBanner = document.querySelector(".outgoing-call");
      outgoingCallBanner.style.display = "flex";

      // find outgoing call element and update call status
      const callStatus = $(".outgoing-call").find(".call-status");
      if (callStatus) {
        $(callStatus).text("Calling...");
      }
    } else {
      // make the call in minimised window position
      $(".incoming-outgoing-call-window").addClass("call-minimised");
      // first hide outgoing call banner if it was opened
      const outgoingCallBanner = document.querySelector(".outgoing-call");
      outgoingCallBanner.style.display = "none";

      // display incoming call banner
      const incomingCallBanner = document.querySelector(".incoming-call");
      incomingCallBanner.style.display = "flex";

      // disable exit button
      $(".call-exit-icon").css({ display: "none" });
    }

    // show rejected call options
    $("#rejected-call-options").css({ display: "none" });
  }

  updateCallModal(message, isOutgoingCall) {
    // enable video call option
    $("#user-video-button").attr("disabled", false);
    // update icon
    $("#user-video-button").removeClass("fa-video-slash disabled-video-button");
    $("#user-video-button").addClass("fa-video");

    // remove previous animation and add new animation
    $("#rejected-call-options").removeClass("animate__fadeIn animate__fadeOut");
    $("#rejected-call-options").addClass("animate__fadeIn");

    // show rejected call options
    $("#rejected-call-options").css({ display: "flex" });

    // find outgoing call element and update call status
    const callStatus = $(".outgoing-call").find(".call-status");

    if (isOutgoingCall) {
      // remove previous animation and add new animation
      $(callStatus).removeClass("animate__fadeIn animate__fadeOut");
      $(callStatus).addClass("animate__fadeIn");
      if (callStatus) {
        $(callStatus).text(message);
      }
    } else {
      // remove animation classes from outgoing call banner and reciever video cover
      $(".outgoing-call").removeClass(
        "incoming-outgoing-shrink-animate incoming-outgoing-exp-animate"
      );
      $(".receiver-card-cover").removeClass(
        "receiver-card-shrink-animate receiver-card-exp-animate"
      );

      // remove outgoing/incoming call banner
      $(".outgoing-call").css({ display: "flex" });
      $(".incoming-call").css({ display: "none" });

      // hide header info
      $("#user-call-header").css({ display: "none" });

      // display receiver video cover
      $(".receiver-video").css({ display: "none" });
      $(".receiver-card-cover").css({ display: "flex" });

      if (callStatus) {
        $(callStatus).text("Call ended!");
      }
    }
  }

  showIncomingCallToast(self) {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    // $(".call-container").css({ display: "none" });
    if ($(incomingOutgoingCallWindow).css("display") === "none") {
      $(incomingOutgoingCallWindow).removeClass(
        "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
      );
      $(incomingOutgoingCallWindow).addClass("animate__bounceInLeft");
      $(incomingOutgoingCallWindow).css({ display: "flex" });
    }
    // // update toast background with user avatar
    // $(incomingOutgoingCallWindow).css({
    //   background: `linear-gradient(
    //   to bottom,
    //   rgba(0, 0, 0, 0.65) 0%,
    //   rgba(0, 0, 0, 0.65) 100%
    // ),
    // url("${data.user_profile}") center / cover no-repeat`,
    // });

    // // set reciever name and avatar
    // $(incomingOutgoingCallWindow).find("img").attr("src", data.user_profile);
    // $(incomingOutgoingCallWindow).find(".username").text(data.user_name);
  }

  hideIncomingCallToast(self) {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");
    // remove all animation classes first
    $(incomingOutgoingCallWindow).removeClass(
      "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
    );

    const callModal = $(".call-container");
    // if callmodal is not visible then add bounce out animation
    if ($(callModal).css("display") === "none") {
      $(incomingOutgoingCallWindow).addClass("animate__bounceOutLeft");
    } else {
      // else fade out
      $(incomingOutgoingCallWindow).addClass("animate__fadeOut");
    }

    setTimeout(() => {
      $(incomingOutgoingCallWindow).css({ display: "none" });
      // if button that cliced is on the toast then manually trigger call expand button
      $(".call-minimise-button").trigger("click");
      self.removeZoomInAnimations();
      self.removeZoomOutAnimations();
    }, 700);
  }

  handleCallMinimise(self) {
    const callModal = $(".call-container");
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    $(".call-minimise-button").click(function () {
      // hide button
      $(".call-expand-button").css({ display: "block" });
      $(callModal).removeClass("animate__fadeIn");
      $(callModal).addClass("animate__fadeOut");
      $(incomingOutgoingCallWindow).removeClass(
        "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
      );
      $(incomingOutgoingCallWindow).removeClass("call-maximised");

      self.addZoomOutAnimation(self);

      setTimeout(() => {
        $(incomingOutgoingCallWindow).addClass("call-minimised");
      }, 500);

      // $(incomingOutgoingCallWindow).css({ display: "flex" });
      // $(incomingOutgoingCallWindow).removeClass("animate__bounceInLeft");
      // $(incomingOutgoingCallWindow).removeClass("animate__fadeOut");
      // $(incomingOutgoingCallWindow).addClass("animate__fadeIn");
    });
  }

  handleCallMaximise(self) {
    const callModal = $(".call-container");
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    $(".call-expand-button").click(function () {
      // show minimise button
      $(".call-expand-button").css({ display: "none" });
      $(callModal).css({ display: "flex" });
      $(callModal).removeClass("animate__fadeOut");
      $(callModal).addClass("animate__fadeIn");
      $(incomingOutgoingCallWindow).removeClass(
        "animate__fadeIn animate__fadeOut animate__bounceInLeft animate__bounceOutLeft toast-container-exp-animate toast-container-shrink-animate"
      );
      $(incomingOutgoingCallWindow).removeClass("call-minimised");

      self.addZoomInAnimation(self);

      setTimeout(() => {
        $(incomingOutgoingCallWindow).addClass("call-maximised");
      }, 500);

      // $(incomingOutgoingCallWindow).removeClass("animate__fadeIn");
      // $(incomingOutgoingCallWindow).addClass("animate__fadeOut");
    });
  }

  addZoomInAnimation(self) {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    // remove previous animation classes
    self.removeZoomOutAnimations();
    // add new animation classes
    $(incomingOutgoingCallWindow).addClass("toast-container-exp-animate");
    $(".incoming-call, .outgoing-call").addClass(
      "incoming-outgoing-exp-animate"
    );
    $(".receiver-card-cover").addClass("receiver-card-exp-animate");
  }

  addZoomOutAnimation(self) {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    // remove previous animation classes
    self.removeZoomInAnimations();
    // add new animation classes
    $(incomingOutgoingCallWindow).addClass("toast-container-shrink-animate");
    $(".incoming-call, .outgoing-call").addClass(
      "incoming-outgoing-shrink-animate"
    );
    $(".receiver-card-cover").addClass("receiver-card-shrink-animate");
  }

  removeZoomOutAnimations() {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    $(incomingOutgoingCallWindow).removeClass("toast-container-shrink-animate");
    $(".incoming-call, .outgoing-call").removeClass(
      "incoming-outgoing-shrink-animate"
    );
    $(".receiver-card-cover").removeClass("receiver-card-shrink-animate");
  }

  removeZoomInAnimations() {
    const incomingOutgoingCallWindow = $(".incoming-outgoing-call-window");

    $(incomingOutgoingCallWindow).removeClass("toast-container-exp-animate");
    $(".incoming-call, .outgoing-call").removeClass(
      "incoming-outgoing-exp-animate"
    );
    $(".receiver-card-cover").removeClass("receiver-card-exp-animate");
  }

  sendPrivateMessage(self, msg, fromUser, toUser, chatRoom) {
    // send message to the server
    self.socket.emit("send_private_message", {
      message: msg,
      messageType: "call",
      user_email: self.userEmail,
      user_name: self.userName,
      user_profile: self.userProfile,
      time: new Date().toLocaleTimeString("en-US", {
        hour12: true,
        hour: "numeric",
        minute: "numeric",
      }),
      from_user: fromUser,
      to_user: toUser,
      chatroom: chatRoom,
    });

    fetch(
      `/api/v1/chat/createmessage/${msg}/private/${fromUser}/${toUser}/${chatRoom}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // console.log(data);
      })
      .catch(function (err) {
        // console.log(err);
      });
  }

  displayNotification(message, type, duration, icon) {
    if (type === "error") {
      if (!icon) {
        icon =
          "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9";
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
        onClick: function () {}, // Callback after click
      }).showToast();
    } else if (type === "success") {
      if (!icon) {
        icon =
          "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d";
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
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }
}
