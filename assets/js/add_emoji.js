const picker = new EmojiButton({
  theme: "dark",
  autoHide: true,
});
let commentInputBoxId = null;

function emojiClicked(e, id) {
  picker.togglePicker(e.target);
  commentInputBoxId = id;
}
picker.on("emoji", (emoji) => {
  document.getElementById(`input-add-comment-${commentInputBoxId}`).value +=
    emoji;
});
