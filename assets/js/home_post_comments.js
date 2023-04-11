class PostComments {
    constructor(postId){
        this.postId = postId;
        this.postContainer = $(`#post-${postId}`);
        this.newCommentForm = $(`#post-${postId}-comments-form`);

        this.createComment(postId);

        let self = this;
        // call for all the existing comments
        $(' .delete-comment-button', this.postContainer).each(function(){
            self.deleteComment($(this));
        });
    }

    createComment(postId) {
        let pSelf = this;
        
        this.newCommentForm.submit(function(e) {
            e.preventDefault();
            let self = this;

            $.ajax({
                type: 'post',
                url: '/comments/create',
                data: $(self).serialize(), //this converts data in json objects
                success: function(data) {
                    let newComment = pSelf.newCommentDom(data.data.comment);
                    $(`#post-comments-${postId}`).prepend(newComment);
                    pSelf.deleteComment($(' .delete-comment-button', newComment));

                     //enable the functionality of the toggle liek button on the new post
                    new ToggleLike($(' .toggle-like-button', newComment));
                    

                }, error: function(error) {
                    // console.log(error.responseText);
                    // new Noty({
                    //     theme: 'relax',
                    //     text: 'Something went wrong!',
                    //     type: 'error',
                    //     layout: 'topRight',
                    //     timeout: 2000
                    // }).show();
                }
            });
        });
    }

    deleteComment(deleteLink) {
        $(deleteLink).click(function(e) {
            e.preventDefault();
            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data) {
                    $(`#comment-${data.comment_id}`).remove();
                    new Noty({
                        theme: 'relax',
                        text: data.data.success,
                        type: 'success',
                        layout: 'topRight',
                        timeout: 3000
                    }).show();
                }, error: function(error) {
                    // console.log(error.responseText);
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



    // <p>${comment.content} - <span>${comment.user.name}</span></p>
    //                     <small>
    //                         <a class="delete-comment-button" href="/comments/destroy/${comment._id}">X</a>
    //                     </small>            
    //                 <br>
    //             </div>




    newCommentDom(comment){
        // I've added a class 'delete-comment-button' to the delete comment link and also id to the comment's li
        return $(`<div id="comment-${comment._id}" class="comment-display">
                    <img src="${comment.user.avatar}" id="user-profile-img">
                    <div class="middle-section">
                        <div class="upper">
                            <p class="comment-user-name">${comment.user.name}&nbsp;&nbsp;</p>
                            <p class="comment-user-content"> &nbsp;${comment.content} </p>
                        </div>
                
                        <div class="bottom">
                            <p id="comment-time">3m</p>
                            <p id="reply-button">reply</p>
                            
                                <a class="delete-comment-button" href="/comments/destroy/${comment._id}"><i class="fa-regular fa-circle-xmark"></i></a>
                            
                            
                
                        </div>
                        
                    </div>
                
                    
                    <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${comment._id}&type=Comment"><i style="margin-left: 0px" class="fa-regular fa-heart"></i></a>
                
                    <br>
                </div>
                
                `);
    }


}

