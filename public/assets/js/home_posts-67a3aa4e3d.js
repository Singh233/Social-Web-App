{FilePond.registerPlugin(FilePondPluginImageCrop,FilePondPluginImagePreview,FilePondPluginImageResize);const e=document.querySelector('input[type="file"]');FilePond.create(e,{imageCropAspectRatio:1,imageResizeTargetWidth:256,imageResizeMode:"contain",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const n=new Image;n.src=URL.createObjectURL(t),document.body.appendChild(n)}});let t=function(){let e=$("#new-post-form");e.submit((function(t){t.preventDefault(),console.log(new FormData(this)),$.ajax({type:"post",url:"/posts/create",data:e.serialize(),success:function(e){let t=n(e.data.post);$("#posts-list-container").prepend(t),s($(" .delete-post-button",t)),new PostComments(e.data.post._id),new ToggleLike($(" .toggle-like-button",t)),new Noty({theme:"relax",text:e.data.success,type:"success",layout:"topRight",timeout:3e3}).show()},error:function(e){console.log(e.responseText),new Noty({theme:"relax",text:"Something went wrong!",type:"error",layout:"topRight",timeout:2e3}).show()}})}))},n=function(e){return $(`<div id="post-${e._id}" class="display-posts">\n                \n                \n                \n\n                <div class="post-header">\n                    <img src="${e.user.avatar}" id="user-profile-img">\n                    <p>${e.user.name}</p>\n                    <div id="post-menu-options">\n                        <i class="fa-solid fa-ellipsis-vertical"></i>\n\n                        <small>\n                            <a class="delete-post-button" href="/posts/destroy/${e._id}">X</a>\n                        </small>\n                    </div>\n                    \n                </div>\n\n                <div class="post-img">\n                    <img src="/img/1782188.jpeg">\n                </div>\n\n                <div class="post-footer">\n                    <div class="post-options">\n                        <div class="left">\n                        <a class="toggle-like-button" data-likes="0" href="/likes/toggle/?id=${e._id}&type=Post"><i style="margin-left: 0px" class="fa-regular fa-heart"></i> <span>0</span></a>\n                \n                        <a href="#">\n                            <i style="transform: rotateY(180deg);" class="fa-regular fa-comment"></i><span>0</span>\n                        </a>\n                        <a class="share-button" href="#">\n                            <i style="font-size: 1.2rem;" class="fa-regular fa-paper-plane"></i>\n                        </a>\n                        </div>\n\n                        <div class="right">\n                            <i class="fa-regular fa-bookmark"></i>\n                        </div>\n                        \n                    </div>\n\n                    \n\n\n                    <div class="post-caption">\n                        <p class="post-user-name">${e.user.name} - &nbsp; </p>\n                        <p class="post-user-content">${e.content}</p>\n                    </div>\n                    \n                    <div id="comments-list-container" class="post-comments-list">\n                        <ul id="post-comments-${e._id}">\n                            \n                        </ul>\n                    </div>\n                    <div class="post-comments">\n                        \n                            <form id="post-${e._id}-comments-form" action="/comments/create" method="POST">\n                                <i  class="fa-regular fa-face-smile emoji-button"></i>\n                                <input class="input-add-comment" type="text" name="content" placeholder="add a comment..." required>\n                                <input type="hidden" name="postId" value="${e._id}" >\n                                <input class="submit-button" type="submit" value="Post">\n                            </form>\n                \n                    </div>`)},s=function(e){$(e).click((function(t){t.preventDefault(),$.ajax({type:"get",url:$(e).prop("href"),success:function(e){$(`#post-${e.data.post_id}`).remove(),new Noty({theme:"relax",text:e.data.success,type:"success",layout:"topRight",timeout:3e3}).show()},error:function(e){console.log(e.responseText),new Noty({theme:"relax",text:"Something went wrong!",type:"error",layout:"topRight",timeout:2e3}).show()}})}))},o=function(){$("#posts-list-container").each((function(){let e=$(this),t=$(" .delete-post-button",e);s(t);let n=e.prop("id").split("-")[1];new PostComments(n)}))};t(),o()}