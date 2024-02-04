/* eslint-disable no-undef */

let prevUsername = $("#name-input").val();
$("#edit-profile-form").submit(function (e) {
  e.preventDefault();
  const form = document.querySelector("#edit-profile-form");
  const formData = new FormData(form);
  if (
    prevUsername === $("#name-input").val() &&
    formData.get("filepond").size === 0
  ) {
    showNotification("Already up to date!", "success", 2000, null);
    return;
  }

  const id = $("#local_user_id").val();

  // disable submit button
  const submitButton = $("#profile-update-button");
  submitButton.text("Updating...");
  submitButton.prop("disabled", true);
  submitButton.css({ cursor: "not-allowed" });

  $.ajax({
    type: "post",
    url: `/users/update/${id}`,
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      const { user } = data.data;
      // console.log(data.data);
      showNotification(data.data.success, "success", 2000, null);

      prevUsername = user.name;
      // update image
      $("#user-avatar").attr("src", user.avatar);
      $("#user-nav-profile-img").attr("src", user.avatar);
      $("#user-nav-name").text(user.name.substring(0, 14));
      // remove the image preview of filepond
      profilePond.removeFile();

      submitButton.prop("disabled", false);
      submitButton.text("Update");
      submitButton.css({ cursor: "pointer" });
    },
    xhr: function () {
      const xhr = new window.XMLHttpRequest();
      let runOnce = true;

      xhr.upload.addEventListener(
        "progress",
        function (evt) {
          if (evt.lengthComputable) {
            const percentComplete = Math.round((evt.loaded / evt.total) * 100);
            // videoUploadStatusContainer.css({ display: "flex" });
            if (percentComplete % 5 === 0) {
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
    },
  });
});
