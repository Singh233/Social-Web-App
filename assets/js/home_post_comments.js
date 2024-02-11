/* eslint-disable no-undef */
class PostComments {
  constructor(postId) {
    this.postId = postId;
    this.postContainer = $(`#post-${postId}`);
    this.newCommentForm = $(`#post-${postId}-comments-form`);

    this.createComment(postId);

    let self = this;
    // call for all the existing comments
    $(" .delete-comment-button", this.postContainer).each(function () {
      self.deleteComment($(this));
    });
  }

  createComment(postId) {
    let pSelf = this;

    this.newCommentForm.submit(function (e) {
      e.preventDefault();
      let self = this;
      $(self).find(".comment-add-loader").css({ display: "flex" });
      $(self).find(".comment-add-button").css({ display: "none" });

      $.ajax({
        type: "post",
        url: "/comments/create",
        data: $(self).serialize(), //this converts data in json objects
        success: function (data) {
          let newComment = pSelf.newCommentDom(data.data.comment);
          $(`#post-comments-${postId}`)
            .find(`#no-comments-${postId}`)
            .css({ display: "none" });
          $(`#post-comments-${postId}`).prepend(newComment);
          pSelf.deleteComment($(" .delete-comment-button", newComment));

          //enable the functionality of the toggle liek button on the new post
          new ToggleLike($(" .toggle-like-button", newComment));
          self.reset();
          $(self).find(".comment-add-loader").css({ display: "none" });
          $(self).find(".comment-add-button").css({ display: "flex" });
        },
        error: function (error) {
          // console.log(error.responseText);
          // new Noty({
          //     theme: 'relax',
          //     text: 'Something went wrong!',
          //     type: 'error',
          //     layout: 'topRight',
          //     timeout: 2000
          // }).show();
        },
      });
    });
  }

  deleteComment(deleteLink) {
    $(deleteLink).click(function (e) {
      e.preventDefault();
      $(this).text("deleting...");
      $.ajax({
        type: "get",
        url: $(deleteLink).prop("href"),
        success: function (data) {
          const { post: postId } = data.data.comment;
          $(`#comment-${data.comment_id}`).removeClass("animate__fadeIn");
          $(`#comment-${data.comment_id}`).addClass("animate__fadeOut");
          setTimeout(() => {
            $(`#comment-${data.comment_id}`).remove();
            if ($(`#post-comments-${postId}`).children().length <= 1) {
              $(`#post-comments-${postId}`)
                .find(`#no-comments-${postId}`)
                .css({ display: "block" });
            }
          }, 500);

          Toastify({
            text: "Comment removed!",
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
              background: "#000000",
              borderRadius: "10px",
              border: "1px solid rgba(231, 231, 231, 0.233)",
            },
            onClick: function () {}, // Callback after click
          }).showToast();
        },
        error: function (error) {
          // console.log(error.responseText);
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
              background: "#000000",
              borderRadius: "10px",
              border: "1px solid rgba(231, 231, 231, 0.233)",
            },
            onClick: function () {}, // Callback after click
          }).showToast();
        },
      });
    });
  }

  // <p>${comment.content} - <span>${comment.user.name}</span></p>
  //                     <small>
  //                         <a class="delete-comment-button" href="/comments/destroy/${comment._id}">X</a>
  //                     </small>
  //                 <br>
  //             </div>

  newCommentDom(comment) {
    // I've added a class 'delete-comment-button' to the delete comment link and also id to the comment's li
    return $(`<div id="comment-${comment._id}" class="comment-display animate__animated animate__fadeIn">
                    <img src="${comment.user.avatar}" id="user-profile-img">
                    <div class="middle-section">
                        <div class="upper">
                            <p class="comment-user-name">${comment.user.name}&nbsp;&nbsp;</p>
                            <p class="comment-user-content"> &nbsp;${comment.content} </p>
                        </div>
                
                        <div class="bottom">
                            <p id="comment-time">Just now</p>
                            
                            <a class="delete-comment-button" href="/comments/destroy/${comment._id}">delete</a>
                            
                            
                
                        </div>
                        
                    </div>
                
                    
                    <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${comment._id}&type=Comment"><i style="margin-left: 0px" class="fa-regular fa-heart"></i></a>
                
                    <br>
                </div>
                
                `);
  }
}
