{FilePond.registerPlugin(FilePondPluginImageCrop,FilePondPluginImagePreview,FilePondPluginImageResize);const e=document.querySelector("#myfile"),t=document.querySelector("#myfile-sm"),o=document.querySelector("#profile-file");FilePond.create(e,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"contain",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const o=new Image;o.src=URL.createObjectURL(t),document.body.appendChild(o)}}),FilePond.create(t,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"contain",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const o=new Image;o.src=URL.createObjectURL(t),document.body.appendChild(o)}}),FilePond.create(o,{imageCropAspectRatio:1,storeAsFile:!0,imageResizeTargetWidth:256,imageResizeMode:"contain",onaddfile:(e,t)=>{console.log(e,t.getMetadata("resize"))},onpreparefile:(e,t)=>{const o=new Image;o.src=URL.createObjectURL(t),document.body.appendChild(o)}});let n=function(e){$(e).click((function(t){t.preventDefault(),$.ajax({type:"get",url:$(e).prop("href"),success:function(e){$(`#post-${e.data.post_id}`).remove(),Toastify({text:e.data.success,duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#0057D2",borderRadius:"10px"},onClick:function(){}}).showToast()},error:function(e){console.log(e.responseText),Toastify({text:"Something went wrong!",duration:2e3,destination:"",newWindow:!0,close:!0,avatar:"https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",gravity:"top",position:"center",stopOnFocus:!0,style:{background:"#D20A0A",borderRadius:"10px",color:"white"},onClick:function(){}}).showToast()}})}))};(function(){$("#posts-list-container").each((function(){let e=$(this),t=$(" .delete-post-button",e);n(t);let o=e.prop("id").split("-")[1];new PostComments(o)}))})()}