function upload(){const e=document.querySelector(".home-container"),o=document.querySelector(".search-page-container"),t=document.querySelector(".profile-page-container"),c=document.querySelector(".post-upload-container");e.classList.add("remove"),o.classList.add("remove"),t.classList.add("remove"),c.classList.remove("remove"),document.getElementById("logo-placeholder").src="img/upload.png",document.getElementById("name-placeholder").innerText="Create new post"}function home(){const e=document.querySelector(".home-container"),o=document.querySelector(".search-page-container"),t=document.querySelector(".profile-page-container"),c=document.querySelector("#post-upload-container");e.classList.remove("remove"),o.classList.add("remove"),t.classList.add("remove"),c.classList.add("remove"),document.getElementById("logo-placeholder").src="img/logo1.png",document.getElementById("name-placeholder").innerText="Howdy,"}function search(){const e=document.querySelector(".home-container"),o=document.querySelector(".search-page-container"),t=document.querySelector(".profile-page-container"),c=document.querySelector(".post-upload-container");o.classList.remove("remove"),e.classList.add("remove"),t.classList.add("remove"),c.classList.add("remove"),document.getElementById("logo-placeholder").src="img/logo1.png",document.getElementById("name-placeholder").innerText="Howdy,"}function profile(){const e=document.querySelector(".home-container"),o=document.querySelector(".search-page-container"),t=document.querySelector(".profile-page-container"),c=document.querySelector(".post-upload-container");o.classList.add("remove"),e.classList.add("remove"),t.classList.remove("remove"),c.classList.add("remove"),document.getElementById("logo-placeholder").src="img/logo1.png",document.getElementById("name-placeholder").innerText="Howdy,"}