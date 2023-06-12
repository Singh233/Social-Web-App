/* eslint-disable no-restricted-syntax */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-new */
/* eslint-disable no-undef */

{
  FilePond.registerPlugin(
    FilePondPluginImageCrop,
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginImageTransform,
    FilePondPluginImageResize,
    // corrects mobile image orientation
    FilePondPluginImageExifOrientation,

    // validates the size of the file
    FilePondPluginFileValidateSize,
    FilePondPluginImageEdit
  );

  // Filepond initialisation logic

  const inputElement = document.querySelector("#myfile");
  const inputElement2 = document.querySelector("#myfile-sm");
  const inputElement3 = document.querySelector("#profile-file");

  const pond = FilePond.create(inputElement, {
    storeAsFile: true,
    acceptedFileTypes: ["image/png", "image/jpeg"],
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

  const pond2 = FilePond.create(inputElement2, {
    storeAsFile: true,
    acceptedFileTypes: ["image/png", "image/jpeg"],
    allowImageTransform: true,
    imageTransformOutputQuality: 75,
    allowImageExifOrientation: true,

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
                    <div class="blur-load" style="background-image: url(${
                      post.thumbnail
                        ? post.thumbnail
                        : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                    })">
                      <img src="${
                        post.myfile
                          ? post.myfile
                          : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                      }" loading="lazy" />
                    </div>
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
                            <i style="transform: rotateY(180deg);" class="fa-regular fa-comment"></i><span>0</span>
                        </a>
                        <a class="share-button" href="#">
                            <i style="font-size: 1.2rem;" class="fa-regular fa-paper-plane"></i>
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
                        <p class="post-user-content">${post.content}</p>
                    </div>

                    <div class="time">
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
                                <input class="submit-button" type="submit" value="Post">
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
                        <a href="/users/profile/${
                          post.user._id
                        }"> <i class="fa-solid fa-user"></i> Go to profile</a>
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
                    <div class="blur-load" style="background-image: url(${
                      post.thumbnail
                        ? post.thumbnail
                        : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                    })">
                      <img src="${
                        post.myfile
                          ? post.myfile
                          : "https://e0.pxfuel.com/wallpapers/238/155/desktop-wallpaper-oceanic-gradient-for-mac-in-2021-abstract-iphone-abstract-abstract-macos-monterey.jpg"
                      }" loading="lazy" />
                    </div>
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
                            <i style="transform: rotateY(180deg);" class="fa-regular fa-comment"></i><span>${
                              post.comments.length
                            }</span>
                        </a>
                        <a class="share-button" href="#">
                            <i style="font-size: 1.2rem;" class="fa-regular fa-paper-plane"></i>
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
                        <p class="post-user-content">${post.content}</p>
                    </div>

                    <div class="time">
                        <p>${moment(post.createdAt).fromNow()}</p>
                    </div>
                    
                    <div id="comments-list-container" class="post-comments-list">
                        <ul id="post-comments-${post._id}">
                            ${post.comments
                              .map((comment) => {
                                let flag = false;
                                for (like of comment.likes) {
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
                                <input class="submit-button" type="submit" value="Post">
                            </form>
                
                    </div>`);
  };

  // method to delete a post from DOM

  const deletePost = function (deleteLink) {
    $(deleteLink).click(function (e) {
      e.preventDefault();

      $.ajax({
        type: "get",
        url: $(deleteLink).prop("href"),
        success: function (data) {
          $(`#post-${data.data.post_id}`).remove();
          Toastify({
            text: data.data.success,
            duration: 2000,
            destination: "",
            newWindow: true,
            close: true,
            avatar:
              "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",

            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#0057D2",
              borderRadius: "10px",
            },
            onClick: function () {}, // Callback after click
          }).showToast();
        },
        error: function (error) {
          Toastify({
            text: "Something went wrong!",
            duration: 2000,
            destination: "",
            newWindow: true,
            close: true,
            avatar:
              "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
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
    const form = document.querySelector("#new-post-form");
    const formData = new FormData(form);
    const id = $("#local_user_id").val();

    // disable submit button
    const submitButton = $("#submit");
    submitButton.val("Uploading...");
    submitButton.prop("disabled", true);

    $.ajax({
      type: "post",
      url: `/posts/create/${id}`,
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        // console.log(data.data.post)
        const newPost = newPostDom(data.data.post);
        $("#posts-list-container").prepend(newPost);
        deletePost($(" .delete-post-button", newPost));

        new PostComments(data.data.post._id);
        // enable the functionality of the toggle liek button on the new post
        new ToggleLike($(" .toggle-like-button", newPost));

        // clear the form
        $("#new-post-form")[0].reset();

        // remove the image preview of filepond
        pond.removeFile();
        pond2.removeFile();

        submitButton.val("Post");
        submitButton.prop("disabled", false);
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

        Toastify({
          text: data.data.success,
          duration: 2000,
          destination: "",
          newWindow: true,
          close: true,
          avatar:
            "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",

          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#0057D2",
            borderRadius: "10px",
          },
          onClick: function () {}, // Callback after click
        }).showToast();
      },
      error: function (error) {
        Toastify({
          text: "Something went wrong!",
          duration: 2000,
          destination: "",
          newWindow: true,
          close: true,
          avatar:
            "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
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
      },
    });
  });

  // function to save posts
  function toggleSavePost(postId, type) {
    // check if the icon is solid or regular
    let icon = $(`#icon-${postId}`).hasClass("fa-solid");
    const saveButton = $(`#icon-${postId}`);

    if (icon) {
      type = "unsave";
      saveButton.toggleClass("fa-solid fa-regular");
    } else {
      type = "save";
      saveButton.toggleClass("fa-regular fa-solid");
    }

    // make ajax call to save post
    $.ajax({
      type: "post",
      url: `/posts/${type}/${postId}`,
      success: function (data) {
        Toastify({
          text: data.data.success,
          duration: 2000,
          destination: "",
          newWindow: true,
          close: true,
          avatar:
            "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",

          gravity: "top", // `top` or `bottom`
          position: "center", // `left`, `center` or `right`
          stopOnFocus: true, // Prevents dismissing of toast on hover
          style: {
            background: "#0057D2",
            borderRadius: "10px",
          },
          onClick: function () {}, // Callback after click
        }).showToast();
      },
      error: function (error) {
        Toastify({
          text: "Something went wrong!",
          duration: 2000,
          destination: "",
          newWindow: true,
          close: true,
          avatar:
            "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
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
      },
    });
  }
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
    if (scroll) return;
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
            for (like of post.likes) {
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
}
