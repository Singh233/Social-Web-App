
{
    FilePond.registerPlugin(
        FilePondPluginImageCrop,
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        // FilePondPluginImageTransform
    );

    // Filepond initialisation logic
    // const inputElement = document.querySelector('input[type="file"]');
    // const pond = FilePond.create(inputElement, {
    //     imageCropAspectRatio: 1,

    //     imageResizeTargetWidth: 256,

    //     // set contain resize mode
    //     imageResizeMode: 'contain',

    //     // add onaddfile callback
    //     onaddfile: (error, fileItem) => {
    //         console.log(error, fileItem.getMetadata('resize'));
    //     },

    //      // add onpreparefile callback
    //     onpreparefile: (fileItem, output) => {
    //         // create a new image object
    //         const img = new Image();

    //         // set the image source to the output of the Image Transform plugin
    //         img.src = URL.createObjectURL(output);

    //         // add it to the DOM so we can see the result
    //         document.body.appendChild(img);
    //     }
    // });

    // method to submit the form data for new post using AJAX
    let createPost = function() {
        let newPostForm = $('#new-post-form');

        newPostForm.submit(function(e) {
            e.preventDefault();
            var data = new FormData(this);
            
            $.ajax({
                type: 'post',
                url: '/posts/create',
                data: newPostForm.serialize(), //this converts data in json objects

                success: function(data) {
                    let newPost = newPostDom(data.data.post);
                    $('#posts-list-container').prepend(newPost);
                    deletePost($(' .delete-post-button', newPost));

                    // call the create comment class
                    new PostComments(data.data.post._id);

                    new Noty({
                        theme: 'relax',
                        text: data.data.success,
                        type: 'success',
                        layout: 'topRight',
                        timeout: 3000
                    }).show();
                }, error: function(error) {
                    console.log(error.responseText);
                    new Noty({
                        theme: 'relax',
                        text: 'Something went wrong!',
                        type: 'error',
                        layout: 'topRight',
                        timeout: 2000
                    }).show();
                }
            });
        });
    }

    // method to create a post in DOM
    let newPostDom = function(post) {
        return $(`<div id="post-${post._id}" class="display-posts">
                    <hr>
                    
                    <small>
                        <a class="delete-post-button" href="/posts/destroy/${post._id}">X</a>
                    </small>
                    
                    <p>${post.content}</p>
                    <p>${post.user.name}</p>
                    <div class="post-comments-list">
                        <ul id="post-comments-${post._id}">
                        </ul>
                    </div>
                
                    <div class="post-comments">
                        
                        <form action="/comments/create" method="post">
                            <input type="hidden" name="postId" value="${post._id}">
                            <input type="text" name="content" id=""  placeholder="type here...">
                            <input type="submit" value="Comment">
                        </form>
                        
                    </div>
                    
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
                    new Noty({
                        theme: 'relax',
                        text: data.data.success,
                        type: 'success',
                        layout: 'topRight',
                        timeout: 3000
                    }).show();
                }, error: function(error) {
                    console.log(error.responseText);
                    new Noty({
                        theme: 'relax',
                        text: 'Something went wrong!',
                        type: 'error',
                        layout: 'topRight',
                        timeout: 2000
                    }).show();
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

    convertPostsToAjax();
    createPost();
    
}