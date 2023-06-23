/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
class ChatEngine {
  constructor(chatBoxId, userId, userEmail, userName, userProfile, host) {
    this.chatBox = $(`#${chatBoxId}`);
    this.userEmail = userEmail;
    this.userId = userId;
    this.userName = userName;
    this.userProfile = userProfile;
    // console.log(host)
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
      this.connectionHandler();
    }
  }

  connectionHandler() {
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
      let messageType = "other-message animate__animated  animate__fadeIn";

      if (data.user_email === self.userEmail) {
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

      newMessage.addClass(messageType);

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
