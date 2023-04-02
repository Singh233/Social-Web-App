
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




function closeChatWindow() {
    console.log('close chat clicked');
    const chatContainer = document.querySelector('.user-chat-box');
    chatContainer.classList.add('animate__fadeInUpBig');
    
    chatContainer.classList.add('animate__faster');
    chatContainer.classList.add('animate__slideOutDown');
    
    setTimeout(() => {
        chatContainer.classList.add('remove');
    }, 1000);
    
}

function openChatWindow() {
    const chatContainer = document.querySelector('.user-chat-box');
    chatContainer.classList.remove('remove');
    chatContainer.classList.remove('animate__faster');
    chatContainer.classList.remove('animate__slideOutDown');
    chatContainer.classList.add('animate__fadeInUpBig');

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
