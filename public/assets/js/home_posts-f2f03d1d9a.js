{FilePond.registerPlugin(FilePondPluginImageCrop,FilePondPluginImagePreview,FilePondPluginImageResize);const e=document.querySelector("#myfile"),t=document.querySelector("#myfile-sm"),n=document.querySelector("#profile-file"),o=FilePond.create(e,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"cover",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const n=new Image;n.src=URL.createObjectURL(t),document.body.appendChild(n)}});FilePond.create(t,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"cover",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const n=new Image;n.src=URL.createObjectURL(t),document.body.appendChild(n)}}),FilePond.create(n,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"cover",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const n=new Image;n.src=URL.createObjectURL(t),document.body.appendChild(n)}});let s=function(e){return $(`<div id="post-${e._id}" class="display-posts animate__animated animate__fadeIn">\n                \n\n\n                <div id="bottom-menu-options-${e._id}" class="post-options-menu animate__animated remove">\n                    <button onclick="toggleMenuOptions('${e._id}')" class="cancel-button">\n                        Cancel\n                    </button>\n\n                    <div class="option1">\n                        <a href="/users/profile/${e.user._id}"> <i class="fa-solid fa-user"></i> Go to profile</a>\n                    </div>\n\n                    <div class="option2">\n                        <a class="delete-post-button" href="/posts/destroy/${e._id}"><i class="fa-solid fa-trash"></i> Delete</a>\n                    </div>\n                    \n                </div>\n                \n\n                <div class="post-header">\n                    <img src="${e.user.avatar}" id="user-profile-img">\n                    <p>${e.user.name}</p>\n                    <div id="post-menu-options">\n                        <i onclick="toggleMenuOptions('${e._id}')" class="fa-solid fa-ellipsis-vertical"></i>\n                    </div>\n                    \n                </div>\n\n                <div class="post-img">\n                    <img src="${e.myfile?e.myfile:""}">\n                </div>\n\n                <div class="post-footer">\n                    <div class="post-options">\n                        <div class="left">\n                        \n                        <a class="toggle-like-button " data-likes="0" href="/likes/toggle/?id=${e._id}&type=Post">\n                            <i style="margin-left: 0px" class="fa-regular fa-heart "></i> <span>0</span>\n                        </a>\n                        <a href="#">\n                            <i style="transform: rotateY(180deg);" class="fa-regular fa-comment"></i><span>0</span>\n                        </a>\n                        <a class="share-button" href="#">\n                            <i style="font-size: 1.2rem;" class="fa-regular fa-paper-plane"></i>\n                        </a>\n                        </div>\n\n                        <div class="right">\n                            <i class="fa-regular fa-bookmark"></i>\n                        </div>\n                        \n                    </div>\n\n                    \n\n\n                    <div class="post-caption">\n                        <p class="post-user-name">${e.user.name} - &nbsp; </p>\n                        <p class="post-user-content">${e.content}</p>\n                    </div>\n\n                    <div class="time">\n                        <p>just now</p>\n                    </div>\n                    \n                    <div id="comments-list-container" class="post-comments-list">\n                        <ul id="post-comments-${e._id}">\n                            \n                        </ul>\n                    </div>\n                    <div class="post-comments">\n                        \n                            <form id="post-${e._id}-comments-form" action="/comments/create" method="POST">\n                                <i  class="fa-regular fa-face-smile emoji-button"></i>\n                                <input class="input-add-comment" type="text" name="content" placeholder="add a comment..." required>\n                                <input type="hidden" name="postId" value="${e._id}" >\n                                <input class="submit-button" type="submit" value="Post">\n                            </form>\n                \n                    </div>`)},i=function(e){$(e).click((function(t){t.preventDefault(),$.ajax({type:"get",url:$(e).prop("href"),success:function(e){$(`#post-${e.data.post_id}`).remove(),Toastify({text:e.data.success,duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#0057D2",borderRadius:"10px"},onClick:function(){}}).showToast()},error:function(e){console.log(e.responseText),Toastify({text:"Something went wrong!",duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#D20A0A",borderRadius:"10px",color:"white"},onClick:function(){}}).showToast()}})}))};(function(){$("#posts-list-container>div").each((function(){let e=$(this),t=$(" .delete-post-button",e);i(t);let n=e.prop("id").split("-")[1];new PostComments(n)}))})(),$("#new-post-form").submit((function(e){e.preventDefault();const t=document.querySelector("#new-post-form"),n=new FormData(t),a=$("#local_user_id").val();$.ajax({type:"post",url:"/posts/create/"+a,data:n,processData:!1,contentType:!1,success:function(e){console.log(e.data.post);let t=s(e.data.post);$("#posts-list-container").prepend(t),i($(" .delete-post-button",t)),new PostComments(e.data.post._id),new ToggleLike($(" .toggle-like-button",t)),$("#new-post-form")[0].reset(),o.removeFile(),Toastify({text:e.data.success,duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#0057D2",borderRadius:"10px"},onClick:function(){}}).showToast()},error:function(e){console.log(e.responseText),Toastify({text:"Something went wrong!",duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#D20A0A",borderRadius:"10px",color:"white"},onClick:function(){}}).showToast()}})}))}