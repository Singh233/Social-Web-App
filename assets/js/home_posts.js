
{
    FilePond.registerPlugin(
        FilePondPluginImageCrop,
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        // FilePondPluginImageTransform
    );

    // Filepond initialisation logic

    
    const inputElement = document.querySelector('#myfile');
    const inputElement2 = document.querySelector('#myfile-sm');
    const inputElement3 = document.querySelector('#profile-file');
    
    const pond = FilePond.create(inputElement, {
        imageCropAspectRatio: 1,
        storeAsFile: true,

        imageResizeTargetWidth: 256,

        // set contain resize mode
        imageResizeMode: 'cover',

        // add onaddfile callback
        onaddfile: (error, fileItem) => {
            console.log(error, fileItem.getMetadata('resize'));
        },

         // add onpreparefile callback
        onpreparefile: (fileItem, output) => {
            // create a new image object
            const img = new Image();

            // set the image source to the output of the Image Transform plugin
            img.src = URL.createObjectURL(output);

            // add it to the DOM so we can see the result
            document.body.appendChild(img);
        }
    });


    const pond2 = FilePond.create(inputElement2, {
        imageCropAspectRatio: 1,
        storeAsFile: true,

        imageResizeTargetWidth: 256,

        // set contain resize mode
        imageResizeMode: 'cover',

        // add onaddfile callback
        onaddfile: (error, fileItem) => {
            console.log(error, fileItem.getMetadata('resize'));
        },

         // add onpreparefile callback
        onpreparefile: (fileItem, output) => {
            // create a new image object
            const img = new Image();

            // set the image source to the output of the Image Transform plugin
            img.src = URL.createObjectURL(output);

            // add it to the DOM so we can see the result
            document.body.appendChild(img);
        }
    });

    const profilePond = FilePond.create(inputElement3, {
        imageCropAspectRatio: 1,
        storeAsFile: true,

        imageResizeTargetWidth: 256,

        // set contain resize mode
        imageResizeMode: 'cover',

        // add onaddfile callback
        onaddfile: (error, fileItem) => {
            console.log(error, fileItem.getMetadata('resize'));
        },

         // add onpreparefile callback
        onpreparefile: (fileItem, output) => {
            // create a new image object
            const img = new Image();

            // set the image source to the output of the Image Transform plugin
            img.src = URL.createObjectURL(output);

            // add it to the DOM so we can see the result
            document.body.appendChild(img);
        }
    });



    // method to submit the form data for new post using AJAX
    let createPost = function() {
        let newPostForm = $('#new-post-form');

        // let myFile = document.getElementById('my-file');

            // let mySubmit = document.getElementById('submit');

            // let files = myFile.files;

            // let formData = new FormData();

            // formData.append('myFile', files[0], files[0].name);
            // console.log(formData);

            // let xhr = new XMLHttpRequest();

            // xhr.open('POST', '/posts/create', true);

            // xhr.onload = function(data) {
            //     if (xhr.status === 200) {
            //         console.log(xhr.response);
            //         alert('File successfully uploaded', xhr.response);
                
            //     } else {
                
            //         alert('File upload failed!');
                
            //     }
            // };

            // xhr.send(formData);

        // newPostForm.submit(function(e) {
        //     e.preventDefault();
            
            
            
            
        //     // console.log(data.serializeArray());


        //     console.log(new FormData(this));

        //     $.ajax({
        //         type: 'post',
        //         url: '/posts/create',
        //         data: newPostForm.serialize(), //this converts data in json objects

        //         success: function(data) {
        //             let newPost = newPostDom(data.data.post);
        //             $('#posts-list-container').prepend(newPost);
        //             deletePost($(' .delete-post-button', newPost));
                    
        //             // call the create comment class
        //             new PostComments(data.data.post._id);

        //             //enable the functionality of the toggle liek button on the new post
        //             new ToggleLike($(' .toggle-like-button', newPost));

        //             new Noty({
        //                 theme: 'relax',
        //                 text: data.data.success,
        //                 type: 'success',
        //                 layout: 'topRight',
        //                 timeout: 3000
        //             }).show();
        //         }, error: function(error) {
        //             console.log(error.responseText);
        //             new Noty({
        //                 theme: 'relax',
        //                 text: 'Something went wrong!',
        //                 type: 'error',
        //                 layout: 'topRight',
        //                 timeout: 2000
        //             }).show();
        //         }
        //     });
        // });
    }
    


//     <hr>
                    
//     <small>
//         <a class="delete-post-button" href="/posts/destroy/${post._id}">X</a>
//     </small>
    
//     <p>${post.content}</p>
//     <p>${post.user.name}</p>
//     <div class="post-comments-list">
//         <ul id="post-comments-${post._id}">
//         </ul>
//     </div>

//     <div class="post-comments">
        
//         <form action="/comments/create" method="post">
//             <input type="hidden" name="postId" value="${post._id}">
//             <input type="text" name="content" id=""  placeholder="type here...">
//             <input type="submit" value="Comment">
//         </form>
        
//     </div>
    
// </div>

    // method to create a post in DOM
    let newPostDom = function(post) {
        return $(`<div id="post-${post._id}" class="display-posts animate__animated animate__fadeIn">
                
                
                

                <div class="post-header">
                    <img src="${post.user.avatar}" id="user-profile-img">
                    <p>${post.user.name}</p>
                    <div id="post-menu-options">
                        <i onclick="toggleMenuOptions('${post._id}')" class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    
                </div>

                <div class="post-img">
                    <img src="${post.myfile ? post.myfile : ''}">
                </div>

                <div class="post-footer">
                    <div class="post-options">
                        <div class="left">
                        <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${post._id}&type=Post"><i style="margin-left: 0px" class="fa-regular fa-heart"></i> <span>0</span></a>
                
                        <a href="#">
                            <i style="transform: rotateY(180deg);" class="fa-regular fa-comment"></i><span>0</span>
                        </a>
                        <a class="share-button" href="#">
                            <i style="font-size: 1.2rem;" class="fa-regular fa-paper-plane"></i>
                        </a>
                        </div>

                        <div class="right">
                            <i class="fa-regular fa-bookmark"></i>
                        </div>
                        
                    </div>

                    


                    <div class="post-caption">
                        <p class="post-user-name">${post.user.name} - &nbsp; </p>
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
                        
                            <form id="post-${post._id}-comments-form" action="/comments/create" method="POST">
                                <i  class="fa-regular fa-face-smile emoji-button"></i>
                                <input class="input-add-comment" type="text" name="content" placeholder="add a comment..." required>
                                <input type="hidden" name="postId" value="${post._id}" >
                                <input class="submit-button" type="submit" value="Post">
                            </form>
                
                    </div>`
    )
    }

    // method to delete a post from DOM

    let deletePost = function(deleteLink) {
        $(deleteLink).click(function(e) {
            e.preventDefault();


            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data) {
                    $(`#post-${data.data.post_id}`).remove();
                    Toastify({
                        text: data.data.success,
                        duration: 2000,
                        destination: "",
                        newWindow: true,
                        close: true,
                        avatar: "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",
        
                        gravity: "top", // `top` or `bottom`
                        position: "center", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            background: "#0057D2",
                            borderRadius: "10px",
                        },
                        onClick: function(){} // Callback after click
                    }).showToast();
                }, error: function(error) {
                    console.log(error.responseText);
                    Toastify({
                        text: 'Something went wrong!',
                        duration: 2000,
                        destination: "",
                        newWindow: true,
                        close: true,
                        avatar: "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
                        gravity: "top", // `top` or `bottom`
                        position: "center", // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            background: "#D20A0A",
                            borderRadius: "10px",
                            color: "white",
                        },
                        onClick: function(){} // Callback after click
                    }).showToast();
                }
            })
        })
    }

    // loop over all the existing posts on the page (when the window loads for the first time )
    // and call the delete post method on each post

    let convertPostsToAjax = function() {
        $('#posts-list-container').each(function() {
            let self = $(this);
            let deleteButton = $(' .delete-post-button', self);
            deletePost(deleteButton);

            // get the post's id by splitting the id attribute
            let postId = self.prop('id').split('-')[1];
            
            new PostComments(postId);
        });
    }
    
    //createPost();
    convertPostsToAjax();

    // ajax call to create a post on submit of the form
    $('#new-post-form').submit(function(e) {
        e.preventDefault();
        const form = document.querySelector('#new-post-form');
        const formData = new FormData(form);
        const id = $('#local_user_id').val();

        $.ajax({
            type: 'post',
            url: '/posts/create/' + id,
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {

                let newPost = newPostDom(data.data.post);
                $('#posts-list-container').prepend(newPost);
                deletePost($(' .delete-post-button', newPost));
                new PostComments(data.data.post._id);



                // clear the form
                $('#new-post-form')[0].reset();

                // remove the image preview of filepond
                pond.removeFile();

            }, error: function(error) {
                console.log(error.responseText);
            
            }

        })
    })

        
    
    
}