
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
