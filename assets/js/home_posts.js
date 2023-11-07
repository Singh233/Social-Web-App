/* eslint-disable no-restricted-syntax */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-new */
/* eslint-disable no-undef */

const myConfetti = confetti.create(null, {
  resize: true,
  useWorker: true,
});

FilePond.registerPlugin(
  FilePondPluginImageCrop,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginImageTransform,
  FilePondPluginImageResize,
  // corrects mobile image orientation
  FilePondPluginImageExifOrientation,
  FilePondPluginFileMetadata,
  // validates the size of the file
  FilePondPluginFileValidateSize,
  FilePondPluginImageEdit,
  FilePondPluginMediaPreview
);

// Filepond initialisation logic

const inputElement = document.querySelector("#myfile");
const inputElement2 = document.querySelector("#myfile-sm");
const inputElement3 = document.querySelector("#profile-file");
let fileName = "";
let fileType = "";
let fileSize = 0;
let fileDuration = 0;
const pond = FilePond.create(inputElement, {
  storeAsFile: true,
  acceptedFileTypes: [
    "image/png",
    "image/jpeg",
    "video/quicktime",
    "video/mp4",
  ],
  allowImageTransform: true,
  imageTransformOutputQuality: 75,
  allowImageExifOrientation: true,
  allowImageEdit: true,
  allowImageEditor: true,
  fileValidateTypeDetectType: (source, type) =>
    new Promise((resolve, reject) => {
      // Do custom type detection here and return with promise

      resolve(type);
    }),

  // add onaddfile callback
  onaddfile: (error, fileItem) => {},

  // add onpreparefile callback
  onpreparefile: (fileItem, output) => {
    // create a new image object
    const img = new Image();

    // set the image source to the output of the Image Transform plugin
    img.src = URL.createObjectURL(output);

    // add it to the DOM so we can see the result
    // document.body.appendChild(img);
  },
});

window.URL = window.URL || window.webkitURL;
// Get the filename when a file is added
pond.on("addfile", (error, file) => {
  if (!error) {
    fileName = file.file.name;
    fileType = file.file.type;
    fileSize = file.file.size;
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      const { duration } = video;
      fileDuration = duration;
    };

    video.src = URL.createObjectURL(file.file);
  }
});

const pond2 = FilePond.create(inputElement2, {
  storeAsFile: true,
  acceptedFileTypes: [
    "image/png",
    "image/jpeg",
    "video/quicktime",
    "video/mp4",
  ],
  allowImageTransform: true,
  imageTransformOutputQuality: 75,
  allowImageExifOrientation: true,

  // add onaddfile callback
  onaddfile: (error, file) => {
    if (!error) {
      fileName = file.file.name;
      fileType = file.file.type;
      fileSize = file.file.size;
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const { duration } = video;
        fileDuration = duration;
      };

      video.src = URL.createObjectURL(file.file);
    }
  },

  // add onpreparefile callback
  onpreparefile: (fileItem, output) => {
    // create a new image object
    const img = new Image();

    // set the image source to the output of the Image Transform plugin
    img.src = URL.createObjectURL(output);

    // add it to the DOM so we can see the result
    // document.body.appendChild(img);
  },
});

const profilePond = FilePond.create(inputElement3, {
  storeAsFile: true,
  acceptedFileTypes: ["image/png", "image/jpeg"],
  allowImageTransform: true,
  imageTransformOutputQuality: 75,
  allowImageExifOrientation: true,
  allowImageEdit: true,
});

let renderCommentDom = function (comment, isLiked) {
  return `<div id="comment-${comment._id}" class="comment-display">
          <img src="${comment.user.avatar}" id="user-profile-img">
          <div class="middle-section">
              <div class="upper">
                  <p class="comment-user-name">${
                    comment.user.name
                  }&nbsp;&nbsp;</p>
                  <p class="comment-user-content"> &nbsp;${comment.content} </p>
              </div>
      
              <div class="bottom">
                  <p id="comment-time">${moment(
                    comment.createdAt
                  ).fromNow()}</p>
                  
                  ${
                    $("#user-id").val() === comment.user._id
                      ? `<a class="delete-comment-button" href="/comments/destroy/${comment._id}">delete</a>`
                      : ""
                  }
              </div>
              
          </div>
          

          ${
            isLiked
              ? `<a class="toggle-like-button" data-likes="${comment.likes.length}" href="/likes/toggle/?id=${comment._id}&type=Comment">
                  <i style="margin-left: 0px" class="fa-solid fa-heart liked"></i><span>${comment.likes.length}</span>
              </a>`
              : `<a class="toggle-like-button" data-likes="${comment.likes.length}" href="/likes/toggle/?id=${comment._id}&type=Comment">
                <i style="margin-left: 0px" class="fa-regular fa-heart"></i>
                <span> ${comment.likes.length} </span>
              </a>`
          }
          <br>
      </div>`;
};

// method to create a post in DOM
let newPostDom = function (post) {
  return $(`<div id="post-${
    post._id
  }" class="display-posts animate__animated animate__fadeIn">
                


                <div id="bottom-menu-options-${
                  post._id
                }" class="post-options-menu animate__animated remove">
                    <button onclick="toggleMenuOptions('${
                      post._id
                    }')" class="cancel-button">
                        Cancel
                    </button>

                    <div class="option1">
                        <a href="/users/profile/${
                          post.user._id
                        }"> <i class="fa-solid fa-user"></i> Go to profile</a>
                    </div>

                    <div class="option2">
                        <div class="loader"></div>
                        <a class="delete-post-button" href="/posts/destroy/${
                          post._id
                        }"><i class="fa-solid fa-trash"></i> Delete</a>
                    </div>
                    
                </div>
                

                <div class="post-header">
                    <img src="${post.user.avatar}" id="user-profile-img">
                    <p>${post.user.name}</p>
                    <div id="post-menu-options">
                        <i onclick="toggleMenuOptions('${
                          post._id
                        }')" class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    
                </div>

                
                <div class="post-img">
                  ${
                    post.isImg
                      ? `<div class="blur-load" style="background-image: url(${
                          post.thumbnail
                            ? post.thumbnail
                            : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                        })">
                    <img src="${
                      post.imgPath
                        ? post.imgPath
                        : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                    }" loading="lazy" />
                  </div>`
                      : `
                      <video
                      id="video-${post.video._id}"
                      class="video-js vjs-theme-forest vjs-fluid"
                      controls
                      preload="auto"
                      width="640"
                      height="640"
                    >
                      <source
                        src="https://storage.googleapis.com/users_videos_bucket/${
                          post.video.qualities[
                            post.video.qualities.findIndex(
                              (ele) => ele.quality === "high"
                            )
                          ].videoPath
                        }/high.m3u8"
                        type="application/x-mpegURL"
                      />
                    </video>`
                  }
                    
                </div>

                <div class="post-footer">
                    <div class="post-options">
                        <div class="left">
                        
                        <a class="toggle-like-button " data-likes="0" href="/likes/toggle/?id=${
                          post._id
                        }&type=Post">
                            <i style="margin-left: 0px" class="fa-regular fa-heart "></i> <span>0</span>
                        </a>
                        <a href="#">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            id="chat-round-line"
                          >
                            <path
                              fill="#111"
                              fill-rule="evenodd"
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14C14.25 13.5858 13.9142 13.25 13.5 13.25H8ZM7.25 10.5C7.25 10.0858 7.58579 9.75 8 9.75H16C16.4142 9.75 16.75 10.0858 16.75 10.5C16.75 10.9142 16.4142 11.25 16 11.25H8C7.58579 11.25 7.25 10.9142 7.25 10.5Z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                            <span>0</span>
                        </a>
                        <a class="share-button" href="#">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            id="forward"
                          >
                            <path
                              fill="#111"
                              d="M13.9548 5.18341L18.9327 9.60815C19.8632 10.4353 20.3285 10.8489 20.5 11.3373C20.6506 11.7662 20.6506 12.2335 20.5 12.6624C20.3285 13.1508 19.8632 13.5644 18.9327 14.3916L13.9548 18.8163C13.5325 19.1917 13.3214 19.3794 13.142 19.3861C12.9862 19.3919 12.8366 19.3247 12.7375 19.2044C12.6233 19.0659 12.6233 18.7834 12.6233 18.2184V15.4284C10.1952 15.4284 7.63068 16.2083 5.75807 17.5926C4.78317 18.3133 4.29571 18.6737 4.11005 18.6595C3.92907 18.6456 3.81422 18.575 3.72032 18.4196C3.62399 18.2603 3.70907 17.7624 3.87924 16.7666C4.98421 10.3004 9.43419 8.57129 12.6233 8.57129V5.78134C12.6233 5.21632 12.6233 4.93381 12.7375 4.79531C12.8366 4.67498 12.9862 4.6078 13.142 4.61363C13.3214 4.62034 13.5325 4.80803 13.9548 5.18341Z"
                            ></path>
                          </svg>
                        </a>
                        </div>

                        <div onclick="toggleSavePost('${
                          post._id
                        }', 'save')" class="right">
                              <i id="icon-${
                                post._id
                              }" class="fa-regular fa-bookmark"></i>
                          </div>
                        
                    </div>

                    


                    <div class="post-caption">
                        <p class="post-user-name">${
                          post.user.name
                        } - &nbsp; </p>
                        <p class="post-user-content">${post.caption}</p>
                    </div>

                    <div class="time">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        id="history"
                      >
                        <path
                          fill="#111"
                          fill-rule="evenodd"
                          d="M11.25 2C11.25 1.58579 11.5858 1.25 12 1.25 17.9371 1.25 22.75 6.06294 22.75 12 22.75 17.9371 17.9371 22.75 12 22.75 6.06294 22.75 1.25 17.9371 1.25 12 1.25 11.5858 1.58579 11.25 2 11.25 2.41421 11.25 2.75 11.5858 2.75 12 2.75 17.1086 6.89137 21.25 12 21.25 17.1086 21.25 21.25 17.1086 21.25 12 21.25 6.89137 17.1086 2.75 12 2.75 11.5858 2.75 11.25 2.41421 11.25 2zM12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V12.25H16C16.4142 12.25 16.75 12.5858 16.75 13 16.75 13.4142 16.4142 13.75 16 13.75H12C11.5858 13.75 11.25 13.4142 11.25 13V9C11.25 8.58579 11.5858 8.25 12 8.25zM9.09958 2.39754C9.24874 2.78396 9.05641 3.21814 8.66999 3.36731 8.52855 3.42191 8.38879 3.47988 8.2508 3.54114 7.87221 3.70921 7.42906 3.53856 7.261 3.15997 7.09293 2.78139 7.26358 2.33824 7.64217 2.17017 7.80267 2.09892 7.96526 2.03147 8.1298 1.96795 8.51623 1.81878 8.95041 2.01112 9.09958 2.39754zM5.6477 4.24026C5.93337 4.54021 5.92178 5.01495 5.62183 5.30061 5.51216 5.40506 5.40505 5.51216 5.30061 5.62183 5.01495 5.92178 4.54021 5.93337 4.24026 5.6477 3.94031 5.36204 3.92873 4.88731 4.21439 4.58736 4.33566 4.46003 4.46002 4.33566 4.58736 4.21439 4.88731 3.92873 5.36204 3.94031 5.6477 4.24026zM3.15997 7.261C3.53856 7.42907 3.70921 7.87222 3.54114 8.2508 3.47988 8.38879 3.42191 8.52855 3.36731 8.66999 3.21814 9.05641 2.78396 9.24874 2.39754 9.09958 2.01112 8.95041 1.81878 8.51623 1.96795 8.12981 2.03147 7.96526 2.09892 7.80267 2.17017 7.64217 2.33824 7.26358 2.78139 7.09293 3.15997 7.261z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                        <p>just now</p>
                    </div>
                    
                    <div id="comments-list-container" class="post-comments-list">
                        <ul id="post-comments-${post._id}">
                        </ul>
                    </div>
                    <div class="post-comments">
                        
                            <form id="post-${
                              post._id
                            }-comments-form" action="/comments/create" method="POST">
                                <i  class="fa-regular fa-face-smile emoji-button"></i>
                                <input id="input-add-comment-${
                                  post._id
                                } class="input-add-comment" type="text" name="content" placeholder="add a comment..." required>
                                <input type="hidden" name="postId" value="${
                                  post._id
                                }" >
                                <button class="submit-button" type="submit">
                                  <div class="comment-add-loader"></div>

                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    id="plain"
                                    class="comment-add-button"
                                    class="comment-add-button"
                                  >
                                    <path
                                      fill="#111"
                                      d="M18.6357 15.6701L20.3521 10.5208C21.8516 6.02242 22.6013 3.77322 21.414 2.58595C20.2268 1.39869 17.9776 2.14842 13.4792 3.64788L8.32987 5.36432C4.69923 6.57453 2.88392 7.17964 2.36806 8.06698C1.87731 8.91112 1.87731 9.95369 2.36806 10.7978C2.88392 11.6852 4.69923 12.2903 8.32987 13.5005C8.77981 13.6505 9.28601 13.5434 9.62294 13.2096L15.1286 7.75495C15.4383 7.44808 15.9382 7.45041 16.245 7.76015C16.5519 8.06989 16.5496 8.56975 16.2398 8.87662L10.8231 14.2432C10.4518 14.6111 10.3342 15.1742 10.4995 15.6701C11.7097 19.3007 12.3148 21.1161 13.2022 21.6319C14.0463 22.1227 15.0889 22.1227 15.933 21.6319C16.8204 21.1161 17.4255 19.3008 18.6357 15.6701Z"
                                    ></path>
                                  </svg>
                                </button>
                            </form>
                
                    </div>`);
};

let renderPostDom = function (post, isLiked, isSaved) {
  return $(`<div id="post-${
    post._id
  }" class="display-posts animate__animated animate__fadeIn">
                


                <div id="bottom-menu-options-${
                  post._id
                }" class="post-options-menu animate__animated remove">
                    <button onclick="toggleMenuOptions('${
                      post._id
                    }')" class="cancel-button">
                        Cancel
                    </button>

                    <div class="option1">
                        <a href="/users/profile/${post.user._id}"> 
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          id="profile"
                        >
                          <path
                            fill="#200E32"
                            d="M5.84846399,13.5498221 C7.28813318,13.433801 8.73442297,13.433801 10.1740922,13.5498221 C10.9580697,13.5955225 11.7383286,13.6935941 12.5099314,13.8434164 C14.1796238,14.1814947 15.2696821,14.7330961 15.73685,15.6227758 C16.0877167,16.317132 16.0877167,17.1437221 15.73685,17.8380783 C15.2696821,18.727758 14.2228801,19.3149466 12.4926289,19.6174377 C11.7216312,19.7729078 10.9411975,19.873974 10.1567896,19.9199288 C9.43008411,20 8.70337858,20 7.96802179,20 L6.64437958,20 C6.36753937,19.9644128 6.09935043,19.9466192 5.83981274,19.9466192 C5.05537891,19.9062698 4.27476595,19.8081536 3.50397353,19.6530249 C1.83428106,19.3327402 0.744222763,18.7633452 0.277054922,17.8736655 C0.0967111971,17.5290284 0.00163408158,17.144037 0.000104217816,16.752669 C-0.00354430942,16.3589158 0.0886574605,15.9704652 0.268403665,15.6227758 C0.72692025,14.7330961 1.81697855,14.1548043 3.50397353,13.8434164 C4.27816255,13.6914539 5.06143714,13.5933665 5.84846399,13.5498221 Z M8.00262682,-1.16351373e-13 C10.9028467,-1.16351373e-13 13.2539394,2.41782168 13.2539394,5.40035587 C13.2539394,8.38289006 10.9028467,10.8007117 8.00262682,10.8007117 C5.10240696,10.8007117 2.75131423,8.38289006 2.75131423,5.40035587 C2.75131423,2.41782168 5.10240696,-1.16351373e-13 8.00262682,-1.16351373e-13 Z"
                            transform="translate(4 2)"
                          ></path>
                        </svg> 
                        Go to profile</a>
                    </div>
                    ${
                      $("#user-id").val() === post.user._id
                        ? `<div class="option2">
                            <a class="delete-post-button" href="/posts/destroy/${post._id}">
                              <i class="fa-solid fa-trash"></i> Delete
                            </a>
                          </div>`
                        : ""
                    }
                    
                </div>
                

                <div class="post-header">
                    <img src="${post.user.avatar}" id="user-profile-img">
                    <p>${post.user.name}</p>
                    <div id="post-menu-options">
                        <i onclick="toggleMenuOptions('${
                          post._id
                        }')" class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    
                </div>

                <div class="post-img">
                  ${
                    post.isImg
                      ? `<div class="blur-load" style="background-image: url(${
                          post.thumbnail
                            ? post.thumbnail
                            : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                        })">
                    <img src="${
                      post.imgPath
                        ? post.imgPath
                        : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                    }" loading="lazy" />
                  </div>`
                      : `
                      <video
                      id="video-${post.video._id}"
                      class="video-js vjs-theme-forest"
                      controls
                      preload="auto"
                      width="640"
                      height="400"
                    >
                      <source
                        src="https://storage.googleapis.com/users_videos_bucket/${
                          post.video.qualities[
                            post.video.qualities.findIndex(
                              (ele) => ele.quality === "high"
                            )
                          ].videoPath
                        }/high.m3u8"
                        type="application/x-mpegURL"
                      />
                    </video>`
                  }
                    
                </div>

                <div class="post-footer">
                    <div class="post-options">
                        <div class="left">
                        
                        ${
                          isLiked
                            ? `<a class="toggle-like-button bg-liked" data-likes="${post.likes.length}" href="/likes/toggle/?id=${post._id}&type=Post">
                                <i style="margin-left: 0px" class="fa-solid fa-heart liked"></i> <span>${post.likes.length}</span>
                            </a>`
                            : `<a class="toggle-like-button " data-likes="${post.likes.length}" href="/likes/toggle/?id=${post._id}&type=Post">
                                <i style="margin-left: 0px" class="fa-regular fa-heart "></i> <span>${post.likes.length}</span>
                            </a>`
                        }

                        <a href="#">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            id="chat-round-line"
                          >
                            <path
                              fill="#111"
                              fill-rule="evenodd"
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14C14.25 13.5858 13.9142 13.25 13.5 13.25H8ZM7.25 10.5C7.25 10.0858 7.58579 9.75 8 9.75H16C16.4142 9.75 16.75 10.0858 16.75 10.5C16.75 10.9142 16.4142 11.25 16 11.25H8C7.58579 11.25 7.25 10.9142 7.25 10.5Z"
                              clip-rule="evenodd"
                            ></path>
                          </svg>
                            <span>${post.comments.length}</span>
                        </a>
                        <a class="share-button" href="#">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                            id="forward"
                          >
                            <path
                              fill="#111"
                              d="M13.9548 5.18341L18.9327 9.60815C19.8632 10.4353 20.3285 10.8489 20.5 11.3373C20.6506 11.7662 20.6506 12.2335 20.5 12.6624C20.3285 13.1508 19.8632 13.5644 18.9327 14.3916L13.9548 18.8163C13.5325 19.1917 13.3214 19.3794 13.142 19.3861C12.9862 19.3919 12.8366 19.3247 12.7375 19.2044C12.6233 19.0659 12.6233 18.7834 12.6233 18.2184V15.4284C10.1952 15.4284 7.63068 16.2083 5.75807 17.5926C4.78317 18.3133 4.29571 18.6737 4.11005 18.6595C3.92907 18.6456 3.81422 18.575 3.72032 18.4196C3.62399 18.2603 3.70907 17.7624 3.87924 16.7666C4.98421 10.3004 9.43419 8.57129 12.6233 8.57129V5.78134C12.6233 5.21632 12.6233 4.93381 12.7375 4.79531C12.8366 4.67498 12.9862 4.6078 13.142 4.61363C13.3214 4.62034 13.5325 4.80803 13.9548 5.18341Z"
                            ></path>
                          </svg>
                        </a>
                        </div>

                        ${
                          isSaved
                            ? `<div onclick="toggleSavePost('${post._id}', 'unsave')" class="right">
                              <i id="icon-${post._id}" class="fa-solid fa-bookmark"></i>
                          </div>`
                            : `<div onclick="toggleSavePost('${post._id}', 'save')" class="right">
                              <i id="icon-${post._id}" class="fa-regular fa-bookmark"></i>
                          </div>`
                        }
                        
                    </div>

                    


                    <div class="post-caption">
                        <p class="post-user-name">${
                          post.user.name
                        } - &nbsp; </p>
                        <p class="post-user-content">${post.caption}</p>
                    </div>

                    <div class="time">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        id="history"
                      >
                        <path
                          fill="#111"
                          fill-rule="evenodd"
                          d="M11.25 2C11.25 1.58579 11.5858 1.25 12 1.25 17.9371 1.25 22.75 6.06294 22.75 12 22.75 17.9371 17.9371 22.75 12 22.75 6.06294 22.75 1.25 17.9371 1.25 12 1.25 11.5858 1.58579 11.25 2 11.25 2.41421 11.25 2.75 11.5858 2.75 12 2.75 17.1086 6.89137 21.25 12 21.25 17.1086 21.25 21.25 17.1086 21.25 12 21.25 6.89137 17.1086 2.75 12 2.75 11.5858 2.75 11.25 2.41421 11.25 2zM12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V12.25H16C16.4142 12.25 16.75 12.5858 16.75 13 16.75 13.4142 16.4142 13.75 16 13.75H12C11.5858 13.75 11.25 13.4142 11.25 13V9C11.25 8.58579 11.5858 8.25 12 8.25zM9.09958 2.39754C9.24874 2.78396 9.05641 3.21814 8.66999 3.36731 8.52855 3.42191 8.38879 3.47988 8.2508 3.54114 7.87221 3.70921 7.42906 3.53856 7.261 3.15997 7.09293 2.78139 7.26358 2.33824 7.64217 2.17017 7.80267 2.09892 7.96526 2.03147 8.1298 1.96795 8.51623 1.81878 8.95041 2.01112 9.09958 2.39754zM5.6477 4.24026C5.93337 4.54021 5.92178 5.01495 5.62183 5.30061 5.51216 5.40506 5.40505 5.51216 5.30061 5.62183 5.01495 5.92178 4.54021 5.93337 4.24026 5.6477 3.94031 5.36204 3.92873 4.88731 4.21439 4.58736 4.33566 4.46003 4.46002 4.33566 4.58736 4.21439 4.88731 3.92873 5.36204 3.94031 5.6477 4.24026zM3.15997 7.261C3.53856 7.42907 3.70921 7.87222 3.54114 8.2508 3.47988 8.38879 3.42191 8.52855 3.36731 8.66999 3.21814 9.05641 2.78396 9.24874 2.39754 9.09958 2.01112 8.95041 1.81878 8.51623 1.96795 8.12981 2.03147 7.96526 2.09892 7.80267 2.17017 7.64217 2.33824 7.26358 2.78139 7.09293 3.15997 7.261z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      <p>${moment(post.createdAt).fromNow()}</p>
                    </div>
                    
                    <div id="comments-list-container" class="post-comments-list">
                        <ul id="post-comments-${post._id}">
                            ${post.comments
                              .map((comment) => {
                                let flag = false;
                                for (const like of comment.likes) {
                                  if (like.user === $("#user-id").val()) {
                                    flag = true;
                                    break;
                                  }
                                }
                                return renderCommentDom(comment, flag);
                              })
                              .join("")}
                        </ul>
                    </div>
                    <div class="post-comments">
                        
                            <form id="post-${
                              post._id
                            }-comments-form" action="/comments/create" method="POST">
                                <i onclick="emojiClicked(event, '${
                                  post._id
                                }')" class="fa-regular fa-face-smile emoji-button"></i>
                                <input id="input-add-comment-${
                                  post._id
                                }" class="input-add-comment" type="text" name="content" placeholder="add a comment..." required>
                                <input type="hidden" name="postId" value="${
                                  post._id
                                }" >
                                <button class="submit-button" type="submit">
                                  <div class="comment-add-loader"></div>

                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    id="plain"
                                    class="comment-add-button"
                                    class="comment-add-button"
                                  >
                                    <path
                                      fill="#111"
                                      d="M18.6357 15.6701L20.3521 10.5208C21.8516 6.02242 22.6013 3.77322 21.414 2.58595C20.2268 1.39869 17.9776 2.14842 13.4792 3.64788L8.32987 5.36432C4.69923 6.57453 2.88392 7.17964 2.36806 8.06698C1.87731 8.91112 1.87731 9.95369 2.36806 10.7978C2.88392 11.6852 4.69923 12.2903 8.32987 13.5005C8.77981 13.6505 9.28601 13.5434 9.62294 13.2096L15.1286 7.75495C15.4383 7.44808 15.9382 7.45041 16.245 7.76015C16.5519 8.06989 16.5496 8.56975 16.2398 8.87662L10.8231 14.2432C10.4518 14.6111 10.3342 15.1742 10.4995 15.6701C11.7097 19.3007 12.3148 21.1161 13.2022 21.6319C14.0463 22.1227 15.0889 22.1227 15.933 21.6319C16.8204 21.1161 17.4255 19.3008 18.6357 15.6701Z"
                                    ></path>
                                  </svg>
                                </button>
                            </form>
                
                    </div>`);
};

// method to delete a post from DOM

const deletePost = function (deleteLink) {
  $(deleteLink).click(function (e) {
    e.preventDefault();

    // Disable the button and change its text to "deleting..."
    const $button = $(this);
    const loader = $(this).parent().find(".loader");
    $button.prop("disabled", true).text("Deleting...");
    $button.css("cursor", "not-allowed"); // Set cursor to "not-allowed"
    loader.css("display", "flex"); // Set cursor to "not-allowed"

    $.ajax({
      type: "get",
      url: $(deleteLink).prop("href"),
      success: function (data) {
        gsap.to($(`#post-${data.data.post_id}`), {
          opacity: 0,
          y: -2000,
          duration: 0.9,
          ease: "power2.inOut",
          onComplete: () => {
            // Optional: You can hide or remove the element after the animation
            $(`#post-${data.data.post_id}`).remove();
          },
        });
        // Re-enable the button and change its text back
        $button.prop("disabled", false).text("Delete");
        $button.css("cursor", "pointer"); // Set cursor back to "pointer"
        loader.css("display", "none"); // Set cursor to "not-allowed"

        showNotification(data.data.success, "success", 2000, null);
      },
      error: function (error) {
        // Re-enable the button and change its text back
        $button.prop("disabled", false).text("Delete");
        $button.css("cursor", "pointer"); // Set cursor back to "pointer"

        showNotification("Something went wrong!", "error", 2000, null);
      },
    });
  });
};

// loop over all the existing posts on the page (when the window loads for the first time )
// and call the delete post method on each post

const convertPostsToAjax = function () {
  // iterate over all posts
  $("#posts-list-container>div").each(function () {
    const self = $(this);
    const deleteButton = $(" .delete-post-button", self);
    deletePost(deleteButton);

    // get the post's id by splitting the id attribute
    const postId = self.prop("id").split("-")[1];
    new PostComments(postId);
  });
};

convertPostsToAjax();

// ajax call to create a post on submit of the form
$("#new-post-form").submit(function (e) {
  e.preventDefault();
  const videoUploadStatusContainer = $("#video-upload-status-container");
  const newPostForm = $(".home-new-post-form");
  const videoUploadProgress = $(".video-upload-progress");

  if (videoUploadStatusContainer.css("display") === "flex") {
    showNotification(
      "Only one upload at a time is allowed",
      "info",
      2500,
      null
    );
    return;
  }
  const form = document.querySelector("#new-post-form");
  const formData = new FormData(form);
  formData.append("fileName", fileName);
  formData.append("fileType", fileType);
  formData.append("fileSize", fileSize);
  formData.append("fileDuration", fileDuration);
  const id = $("#local_user_id").val();

  // disable submit button
  const submitButton = $("#post-submit-1");
  submitButton.find("span").text("Uploading...");
  submitButton.prop("disabled", true);
  submitButton.css({ cursor: "not-allowed" });

  $.ajax({
    type: "post",
    url: `/posts/create/${id}`,
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      if (!data.data.post.isImg) {
        const lsData = {
          progress: 0,
          title: fileName,
        };
        localStorage.setItem(
          "video-processing-progress",
          JSON.stringify(lsData)
        );

        // first fade out
        gsap.to(videoUploadStatusContainer, {
          opacity: 0,
          duration: 0.5,
          delay: 1.7,
          onComplete: () => {
            // Optional: You can hide or remove the element after the animation
            videoUploadStatusContainer.css({ display: "none", opacity: 1 });
            videoUploadStatusContainer
              .find(".header .heading span")
              .text("Processing Video");

            $(".progress-percentage").text(`In queue!`);

            $(".video-upload-progress").LineProgressbar({
              percentage: 0,
              fillBackgroundColor: "#0156D1",
              backgroundColor: "black",
              height: "15px",
              radius: "10px",
              ShowProgressCount: false,
            });
            videoUploadStatusContainer.find(".info").html(
              `<i class="fa-solid fa-circle-info"></i> 
              Processing can take some time. You can scroll the feed or close the tab`
            );
            // then fade in
            gsap.from(videoUploadStatusContainer, {
              opacity: 0,
              duration: 0.5,
              delay: 0.01,
              onStart: () => {
                videoUploadStatusContainer.css({ display: "flex" });
              },
            });
          },
        });
      } else {
        gsap.to(videoUploadStatusContainer, {
          opacity: 0,
          duration: 0.7,
          delay: 1.7,
          onComplete: () => {
            // Optional: You can hide or remove the element after the animation
            videoUploadStatusContainer.css({ display: "none", opacity: 1 });
          },
        });

        setTimeout(() => {
          myConfetti({
            particleCount: 100,
            spread: 80,
            angle: 60,
            origin: { x: 0 },
          });

          myConfetti({
            particleCount: 100,
            spread: 80,
            angle: 120,
            origin: { x: 1 },
          });
          showNotification(data.data.success, "success", 2000, null);
          // console.log(data.data.post)
          const newPost = newPostDom(data.data.post);
          $("#posts-list-container").prepend(newPost);
          deletePost($(".delete-post-button", newPost));

          new PostComments(data.data.post._id);
          // enable the functionality of the toggle liek button on the new post
          new ToggleLike($(" .toggle-like-button", newPost));

          const blurDivs = document.querySelectorAll(".blur-load");

          blurDivs.forEach((div) => {
            const img = div.querySelector("img");
            function loaded() {
              // show img
              div.classList.add("loaded");
            }

            if (img.complete) {
              loaded();
            } else {
              img.addEventListener("load", loaded);
            }
          });
          if (window.innerWidth < 600)
            gsap.from($(".post-upload-form-sm"), {
              opacity: 0,
              duration: 0.5,
              onStart: () => {
                $(".post-upload-form-sm").css({ display: "flex" });
              },
            });
        }, 2400);
      }

      // clear the form
      $("#new-post-form")[0].reset();

      // remove the image preview of filepond
      pond.removeFile();
      pond2.removeFile();

      submitButton.prop("disabled", false);
      submitButton.find("span").text("Post");
      submitButton.css({ cursor: "pointer" });
    },
    xhr: function () {
      const xhr = new window.XMLHttpRequest();

      if (newPostForm.css("display") === "flex") {
        gsap.to(newPostForm, {
          opacity: 0,
          duration: 0.7,
          delay: 0.7,
          onComplete: () => {
            // Optional: You can hide or remove the element after the animation
            newPostForm.css({ display: "none", opacity: 1 });
            gsap.from(videoUploadStatusContainer, {
              opacity: 0,
              duration: 0.5,
              onStart: () => {
                videoUploadStatusContainer.css({ display: "flex" });
              },
            });
          },
        });
      }
      let runOnce = true;

      if (window.innerWidth < 600)
        gsap.to($(".post-upload-form-sm"), {
          opacity: 0,
          duration: 0.7,
          onComplete: () => {
            // Optional: You can hide or remove the element after the animation
            $(".post-upload-form-sm").css({ display: "none", opacity: 1 });
            gsap.from(videoUploadStatusContainer, {
              opacity: 0,
              duration: 0.5,
              onStart: () => {
                videoUploadStatusContainer.css({ display: "flex" });
              },
            });
          },
        });
      xhr.upload.addEventListener(
        "progress",
        function (evt) {
          if (evt.lengthComputable) {
            const percentComplete = Math.round((evt.loaded / evt.total) * 100);
            // videoUploadStatusContainer.css({ display: "flex" });
            if (runOnce) {
              runOnce = false;
              videoUploadStatusContainer
                .find(".header .heading span")
                .text(
                  `Uploading ${
                    fileType === "image/png" ||
                    fileType === "image/jpg" ||
                    fileType === "image/jpeg"
                      ? "Image"
                      : "Video"
                  }`
                );
              videoUploadStatusContainer
                .find(".header .file-name")
                .text(fileName.substring(0, 15));
              videoUploadStatusContainer.find(".info").html(
                `<i class="fa-solid fa-circle-info"></i> 
                    File is being uploaded. Please don't close the tab or refresh.`
              );
            }
            if (percentComplete % 5 === 0) {
              $(".progress-percentage").text(`${percentComplete}%`);
              videoUploadProgress.LineProgressbar({
                percentage: percentComplete,
                fillBackgroundColor: "#0156D1",
                backgroundColor: "#00000000",
                height: "15px",
                radius: "10px",
                ShowProgressCount: false,
              });
            }
          }
        },
        false
      );
      // Upload progress

      return xhr;
    },
    error: function (error) {
      showNotification("Something went wrong!", "error", 2000, null);
      gsap.to(videoUploadStatusContainer, {
        opacity: 0,
        duration: 0.7,
        delay: 1.7,
        onComplete: () => {
          // Optional: You can hide or remove the element after the animation
          videoUploadStatusContainer.css({ display: "none", opacity: 1 });
        },
      });
    },
  });
});

const showNotification = (message, type, duration, icon) => {
  if (type === "error") {
    if (!icon) {
      icon = "https://cdn-icons-png.flaticon.com/128/9426/9426995.png";
    }
  } else if (type === "success") {
    if (!icon) {
      icon = "https://cdn-icons-png.flaticon.com/128/7518/7518748.png";
    }
  } else {
    icon = "https://cdn-icons-png.flaticon.com/128/5683/5683325.png";
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
      background:
        type === "error"
          ? "#000000"
          : type === "success"
          ? "#000000"
          : "#000000",
      borderRadius: "10px",
      color: "white",
      // borderColor: "linear-gradient(-45deg, #ff3c007b 0%, #0400ff7c 69%)"
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};

const skeletonCard = function () {
  return `
    <div class="card animate__animated animate__fadeIn">
      <h2 class="card-header skeleton">
          <!-- wating for title to load from javascript -->
      </h2>
      <div class="card-img skeleton">
        <!-- waiting for img to load from javascript -->
      </div>
      
      <div class="card-footer">
        
        <p class="card-intro skeleton">
          <!-- waiting for intro to load from Javascript -->
        </p>
      </div>
	</div>
    `;
};
let scroll = false;

window.onscroll = (event) => {
  if (scroll || window.location.href.includes("profile")) return;
  // Check if the user is 200 pixels away from the bottom of the page
  if (
    window.innerHeight + window.pageYOffset >=
      document.body.offsetHeight - 200 ||
    (window.innerWidth <= 480 &&
      window.innerHeight + window.pageYOffset >=
        document.body.offsetHeight - 900)
  ) {
    // make ajax call to get posts
    scroll = true;
    const offset = document.querySelectorAll("#posts-list-container")[0]
      .children.length;
    const limit = 5;
    for (let i = 0; i < 5; i++) {
      $("#posts-list-container").append(skeletonCard);
    }
    $.ajax({
      type: "GET",
      url: `/api/v1/posts/index?offset=${offset}&limit=${limit}`,
      success: (data) => {
        // remove skeleton loading
        for (let i = 0; i < 5; i++) {
          if ($("#posts-list-container").children().last().hasClass("card")) {
            $("#posts-list-container").children().last().remove();
          }
        }
        data.data.posts.forEach((post) => {
          // check if the post is liked by the current user
          const userId = $("#user-id").val();
          let flag = false;
          for (const like of post.likes) {
            if (like.user === userId) {
              flag = true;
              break;
            }
          }

          // check if the post is saved by the current user
          const savedPosts = $("#user-saved-posts").val().split(",");
          let isSaved = false;
          for (const savedPostId of savedPosts) {
            if (savedPostId === post._id) {
              isSaved = true;
              break;
            }
          }

          const newPost = renderPostDom(post, flag, isSaved);
          $("#posts-list-container").append(newPost);
          deletePost($(" .delete-post-button", newPost));

          new PostComments(post._id);
          // enable the functionality of the toggle liek button on the new post
          new ToggleLike($(" .toggle-like-button", newPost));
          const blurDivs = document.querySelectorAll(".blur-load");

          blurDivs.forEach((div) => {
            const img = div.querySelector("img");
            function loaded() {
              // show img
              div.classList.add("loaded");
            }

            if (img.complete) {
              loaded();
            } else {
              img.addEventListener("load", loaded);
            }
          });
        });
        refreshVideoPlayback();

        if (data.data.posts.length !== 0) {
          scroll = false;
        }
      },
      error: (error) => {
        console.log(error);
        scroll = false;
      },
    });
  }
};
