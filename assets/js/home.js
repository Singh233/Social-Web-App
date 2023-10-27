/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// logic for sm screen devices

function upload() {
  const homeContainer = document.querySelector(".home-container");

  if (homeContainer) {
    // const profileContainer = document.querySelector('.profile-page-container');
    const postUploadContainer = document.querySelector(
      ".post-upload-container"
    );
    homeContainer.classList.add("remove");

    // profileContainer.classList.add('remove');
    postUploadContainer.classList.remove("remove");

    document.getElementById("logo-placeholder").src = "img/upload.png";
    document.getElementById("name-placeholder").innerText = "Create new post";
  }
}

function home() {
  const homeContainer = document.querySelector(".home-container");
  // const profileContainer = document.querySelector('.profile-page-container');
  const postUploadContainer = document.querySelector(".post-upload-container");
  homeContainer.classList.remove("remove");
  // profileContainer.classList.add('remove');
  postUploadContainer.classList.add("remove");

  document.getElementById("logo-placeholder").src = "img/logo1.png";
  document.getElementById("name-placeholder").innerText = `Howdy,`;
}

function search() {
  const homeContainer = document.querySelector(".home-container");
  const searchContainer = document.querySelector(".search-page-container");
  // const profileContainer = document.querySelector('.profile-page-container');
  const postUploadContainer = document.querySelector(".post-upload-container");
  searchContainer.classList.remove("remove");
  homeContainer.classList.add("remove");
  // profileContainer.classList.add('remove');
  postUploadContainer.classList.add("remove");

  document.getElementById("logo-placeholder").src = "img/logo1.png";
  document.getElementById("name-placeholder").innerText = `Howdy,`;
}

function profile() {
  // const homeContainer = document.querySelector('.home-container');
  // const searchContainer = document.querySelector('.search-page-container');
  // // const profileContainer = document.querySelector('.profile-page-container');
  // const postUploadContainer = document.querySelector('.post-upload-container');
  // searchContainer.classList.add('remove');
  // homeContainer.classList.add('remove');
  // // profileContainer.classList.remove('remove');
  // postUploadContainer.classList.add('remove');
  // document.getElementById('logo-placeholder').src="img/logo1.png";
  // document.getElementById('name-placeholder').innerText = `Howdy,`;
}

function menuButtonClicked() {
  // add animation to the menu button
  // document.getElementById("menu-button").classList.toggle("change");

  // add animation to the right section container
  if ($(".right-section-container").hasClass("animate__slideInRight")) {
    $(".fa-xmark").toggleClass("remove");
    $(".fa-bars").toggleClass("remove");

    $(".right-section-container").removeClass("animate__slideInRight");
    $(".right-section-container").addClass("animate__slideOutRight");

    setTimeout(() => {
      $(".right-section-container").toggleClass("section-visible");
    }, 700);
  } else {
    $(".fa-xmark").toggleClass("remove");
    $(".fa-bars").toggleClass("remove");
    $(".right-section-container").toggleClass("section-visible");

    $(".right-section-container").removeClass("animate__slideOutRight");

    $(".right-section-container").addClass("animate__slideInRight");
  }

  // add visible class to right section container using jquery
}

function toggleChatWindow() {
  const chatContainer = document.querySelector(".user-chat-box");
  const footer = document.querySelector(".footer");
  const chatOverlay = document.querySelector(".chat-overlay");
  // chatContainer.classList.add('animate__fadeInUpBig');

  // chatContainer.classList.add('animate__faster');
  // chatContainer.classList.add('animate__slideOutDown');

  // add fade out animation to chat input container
  if (chatContainer.classList.contains("remove-box")) {
    footer.classList.remove("animate__fadeOut");
    footer.classList.add("animate__fadeIn");

    chatOverlay.classList.remove("animate__fadeIn");
    chatOverlay.classList.add("animate__fadeOut");
    chatOverlay.classList.toggle("chat-overlay-z-index");
  } else {
    footer.classList.remove("animate__fadeIn");
    footer.classList.add("animate__fadeOut");

    chatOverlay.classList.remove("animate__fadeOut");
    chatOverlay.classList.add("animate__fadeIn");
    chatOverlay.classList.toggle("chat-overlay-z-index");
  }

  chatContainer.classList.toggle("remove-box");

  if (
    !$("body").hasClass("stop-scrolling") &&
    window.innerWidth < 600 &&
    !chatContainer.classList.contains("remove-box")
  ) {
    $("body").addClass("stop-scrolling");
  } else {
    $("body").removeClass("stop-scrolling");
  }

  if (window.innerWidth < 600) {
    if (
      $(".left-navigation-container").css("display") === "flex" &&
      !chatContainer.classList.contains("remove-box")
    ) {
      $(".left-navigation-container").css({ display: "none" });
    } else {
      $(".left-navigation-container").css({ display: "flex" });
    }
  }
}

function toggleChatMessages(chatRoomId, userId, profile, name, type) {
  // console.log(userId, name, type);
  // using jquery
  $(".user-chat-box").toggleClass("remove");
  $(`#user-messages-${type}`).toggleClass("remove");
  if (name === "") {
    return;
  }
  $("#chat-room-private-status").removeClass(`${previousId}`);
  $("#chat-room-private-status").addClass(`${userId}`);
  // set the email of the user to the chat header
  document.getElementById("chat-room-private-username").innerText = name;

  // check the status of the user
  if ($(`#status-icon-${userId}`).hasClass("user-active")) {
    // set the font awesome icon color to green
    document
      .getElementById("chat-room-private-status-icon")
      .classList.remove("offline-color");

    document.getElementById("chat-room-private-status-text").innerHTML =
      "Active Now";
  } else {
    // set the font awesome icon color to red
    document
      .getElementById("chat-room-private-status-icon")
      .classList.add("offline-color");

    document.getElementById("chat-room-private-status-text").innerHTML = $(
      `#hidden-status-${userId}`
    ).html();
  }

  // set the profile img of the user to the chat header
  document.getElementById("chat-room-private-profile-img").src = profile
    ? profile
    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png";
  // update the id of the chat messages list
  document.getElementById(
    `chat-messages-list-private-${previousId}`
  ).id = `chat-messages-list-private-${userId}`;
  // set hidden input value to the user id
  document.getElementById("chat-user-id").value = userId;
  // set hidden input value to the chatRoom id
  document.getElementById("chatroom-id").value = chatRoomId;
  // set the previous id to the current id
  previousId = userId;
}

function openChatWindow() {
  const chatContainer = document.querySelector(".user-chat-box");
  chatContainer.classList.remove("remove");
  // chatContainer.classList.remove('animate__faster');
  // chatContainer.classList.remove('animate__slideOutDown');
  // chatContainer.classList.add('animate__fadeInUpBig');
}

function toggleMenuOptions(postId) {
  const menu = document.querySelector(`#bottom-menu-options-${postId}`);
  if ($(`#bottom-menu-options-${postId}`).hasClass("remove")) {
    menu.classList.remove("remove");
    menu.classList.remove("animate__flipOutX");
    menu.classList.add("animate__flipInX");
  } else {
    menu.classList.remove("animate__flipInX");
    menu.classList.add("animate__flipOutX");

    setTimeout(() => {
      menu.classList.add("remove");
    }, 1000);
  }
}

// disable background scroll when cursor is on the chat box
function toggleScroll() {
  $("body").toggleClass("stop-scrolling");
}

// jquery to listen to user-search-bar input field
$("#user-search-bar").on("keyup", function () {
  searchUser($(this), "keyUp");
});

function searchUser(input, type) {
  let userSearchResultDOM = (user) => `
    <div class="user-result animate__animated animate__fadeIn">
        <a href="/users/profile/${user._id}">
            ${
              user.avatar !== undefined
                ? `<img src="${user.avatar}" alt="">`
                : // : `<img id="logo-placeholder" src="img/dummy-profile.jpeg">`
                  `<div class="no-avatar"><i class="fa-solid fa-user"></i></div>`
            }
        </a>
        <a href="/users/profile/${user._id}">
            <p>${user.name}</p>
        </a>

        <i class="fa-solid fa-caret-right arrow-left"></i>
    </div>

`;
  let searchValue = null;
  if (type == "keyUp") {
    searchValue = $(input).val();
  } else {
    searchValue = $("#user-search-bar").val();
  }
  if (searchValue != "") {
    $.ajax({
      url: "/users/search?search=" + searchValue,
      type: "GET",
      success: function (data) {
        // clear the search results
        $("#search-results").html("");
        $("#search-results").css("padding", "10px");

        // append the search results
        data.users.forEach((user) => {
          if (user._id != $("#search-user-id").val())
            $("#search-results").append(userSearchResultDOM(user));
          // add padding to the search results
        });

        // check if search results is empty

        // if no user is found
        if (data.users.length == 0 || $("#search-results").html() == "") {
          $("#search-results").append(
            '<p class="no-user-found animate__animated animate__fadeIn"><i class="fa-regular fa-circle-xmark"></i>No user found</p>'
          );
          // remove padding from the search results
          $("#search-results").css("padding", "0");
        }
      },
    });
  } else {
    $("#search-results").html("");
    $("#search-results").css("padding", "0");
  }
}

// for mobile search bar
$("#user-search-bar-mobile").on("keyup", function () {
  let userSearchResultDOM = (user) => `
    <div class="user-result animate__animated animate__fadeIn">
        <a href="/users/profile/${user._id}">
            ${
              user.avatar != undefined
                ? `<img src="${user.avatar}" alt="">`
                : // : `<img id="logo-placeholder" src="img/dummy-profile.jpeg">`
                  `<div class="no-avatar"><i class="fa-solid fa-user"></i></div>`
            }
        </a>
        <a href="/users/profile/${user._id}">
            <p>${user.name}</p>
        </a>

        <i class="fa-solid fa-caret-right arrow-left"></i>
    </div>

`;
  let searchValue = $(this).val();

  if (searchValue != "") {
    $.ajax({
      url: "/users/search?search=" + searchValue,
      type: "GET",
      success: function (data) {
        // clear the search results
        $("#search-results-mobile").html("");
        $("#search-results-mobile").css("padding", "10px");

        // append the search results
        data.users.forEach((user) => {
          if (user._id != $("#search-user-id").val())
            $("#search-results-mobile").append(userSearchResultDOM(user));
          // add padding to the search results
        });

        // check if search results is empty

        // if no user is found
        if (data.users.length == 0 || $("#search-results").html() == "") {
          $("#search-results-mobile").append(
            '<p class="no-user-found animate__animated animate__fadeIn"><i class="fa-regular fa-circle-xmark"></i>No user found</p>'
          );
          // remove padding from the search results
          $("#search-results-mobile").css("padding", "0");
        }
      },
    });
  } else {
    $("#search-results-mobile").html(`
        <p class="info animate__animated animate__fadeIn">
            <i class="fa-solid fa-magnifying-glass"></i>
            Search for people
        </p>
        `);
    $("#search-results-mobile").css("padding", "0");
  }
});

// for mobile search bar when user clicks on cancel button
$("#cancel-search-mobile").on("click", function () {
  $("#user-search-bar-mobile").val("");
  $("#search-results-mobile").html(`
        <p class="info animate__animated animate__fadeIn">
            <i class="fa-solid fa-magnifying-glass"></i>
            Search for people
        </p>
        `);
  $("#search-results-mobile").css("padding", "0");
});
