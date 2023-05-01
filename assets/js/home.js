
// logic for sm screen devices



function upload() {
    const homeContainer = document.querySelector('.home-container');
    const searchContainer = document.querySelector('.search-page-container');
    // const profileContainer = document.querySelector('.profile-page-container');
    const postUploadContainer = document.querySelector('.post-upload-container');
    homeContainer.classList.add('remove');
    searchContainer.classList.add('remove');
    // profileContainer.classList.add('remove');
    postUploadContainer.classList.remove('remove');

    document.getElementById('logo-placeholder').src="img/upload.png";
    document.getElementById('name-placeholder').innerText = 'Create new post';
}


function home() {
    const homeContainer = document.querySelector('.home-container');
    const searchContainer = document.querySelector('.search-page-container');
    // const profileContainer = document.querySelector('.profile-page-container');
    const postUploadContainer = document.querySelector('.post-upload-container');
    homeContainer.classList.remove('remove');
    searchContainer.classList.add('remove');
    // profileContainer.classList.add('remove');
    postUploadContainer.classList.add('remove');

    document.getElementById('logo-placeholder').src="img/logo1.png";
    document.getElementById('name-placeholder').innerText = `Howdy,`;

}


function search() {
    const homeContainer = document.querySelector('.home-container');
    const searchContainer = document.querySelector('.search-page-container');
    // const profileContainer = document.querySelector('.profile-page-container');
    const postUploadContainer = document.querySelector('.post-upload-container');
    searchContainer.classList.remove('remove');
    homeContainer.classList.add('remove');
    // profileContainer.classList.add('remove');
    postUploadContainer.classList.add('remove');

    document.getElementById('logo-placeholder').src="img/logo1.png";
    document.getElementById('name-placeholder').innerText = `Howdy,`;

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




function toggleChatWindow() {
    const chatContainer = document.querySelector('.user-chat-box');
    const footer = document.querySelector('.footer');
    const chatOverlay = document.querySelector('.chat-overlay');
    // chatContainer.classList.add('animate__fadeInUpBig');
    
    // chatContainer.classList.add('animate__faster');
    // chatContainer.classList.add('animate__slideOutDown');

    // add fade out animation to chat input container
    if (chatContainer.classList.contains('remove-box')) {
        footer.classList.remove('animate__fadeOut');
        footer.classList.add('animate__fadeIn');

        chatOverlay.classList.remove('animate__fadeIn');
        chatOverlay.classList.add('animate__fadeOut');
        chatOverlay.classList.toggle('chat-overlay-z-index')
    } else {
        footer.classList.remove('animate__fadeIn');
        footer.classList.add('animate__fadeOut');

        chatOverlay.classList.remove('animate__fadeOut');
        chatOverlay.classList.add('animate__fadeIn');
        chatOverlay.classList.toggle('chat-overlay-z-index')
    }

    chatContainer.classList.toggle('remove-box');

    if (!$('body').hasClass('stop-scrolling') && window.innerWidth < 468) {
        $('body').addClass('stop-scrolling');
    } else {
        $('body').removeClass('stop-scrolling');
    }
}


function toggleChatMessages(userId, profile, name, type) {
    // console.log(userId, name, type);
    // using jquery
    $('.user-chat-box').toggleClass('remove');
    $(`#user-messages-${type}`).toggleClass('remove');
    if (name != '') {
        // set the email of the user to the chat header
        document.getElementById('chat-room-private-username').innerText = name;
    

        // check the status of the user
        if ($(`#status-${userId}`).html() == '<i class="fa-solid fa-circle"></i> Active Now') {
            // set the font awesome icon color to green
            document.getElementById('chat-room-private-status-icon').classList.remove('offline-color');

            document.getElementById('chat-room-private-status-text').innerHTML = 'Active Now';
        } else {
            // set the font awesome icon color to red
            document.getElementById('chat-room-private-status-icon').classList.add('offline-color');

            document.getElementById('chat-room-private-status-text').innerHTML = $('#status-' + userId).html();
        }
    
        // set the profile img of the user to the chat header
        document.getElementById('chat-room-private-profile-img').src = profile;
        // update the id of the chat messages list
        document.getElementById(`chat-messages-list-private-${previousId}`).id = `chat-messages-list-private-${userId}`;
        // set hidden input value to the user id
        document.getElementById('chat-user-id').value = userId;
        previousId = userId;

    }


}

function openChatWindow() {
    const chatContainer = document.querySelector('.user-chat-box');
    chatContainer.classList.remove('remove');
    // chatContainer.classList.remove('animate__faster');
    // chatContainer.classList.remove('animate__slideOutDown');
    // chatContainer.classList.add('animate__fadeInUpBig');

}



function toggleMenuOptions(postId) {
    const menu = document.querySelector(`#bottom-menu-options-${postId}`);
    if ($(`#bottom-menu-options-${postId}`).hasClass('remove')) {
        menu.classList.remove('remove');
        menu.classList.remove('animate__flipOutX');
        menu.classList.add('animate__flipInX');
    } else {
        menu.classList.remove('animate__flipInX');
        menu.classList.add('animate__flipOutX');
        
        setTimeout(() => {
            menu.classList.add('remove');
        }, 1000);
    }
    
    
    
}




// disable background scroll when cursor is on the chat box 
function toggleScroll() {
    $('body').toggleClass('stop-scrolling');

}



