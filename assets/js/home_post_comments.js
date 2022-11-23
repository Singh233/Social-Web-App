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
                    deleteComment($(' .delete-comment-button', newComment));
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

    newCommentDom(comment){
        // I've added a class 'delete-comment-button' to the delete comment link and also id to the comment's li
        return $(`<div id="comment-${comment._id}">
                    <p>${comment.content} - <span>${comment.user.name}</span></p>
                        <small>
                            <a class="delete-comment-button" href="/comments/destroy/${comment._id}">X</a>
                        </small>            
                    <br>
                </div>`);
    }


}

