const picker = new EmojiButton({
  theme: "dark",
  autoHide: true,
});
function emojiClicked(e, id) {
  picker.togglePicker(e.target);

  picker.on("emoji", (emoji) => {
    document.querySelector(`#input-add-comment-${id}`).value += emoji;
  });
}
