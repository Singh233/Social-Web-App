function emojiClicked(e, id) {
  const picker = new EmojiButton({
    theme: "dark",
  });

  picker.togglePicker(e.target);

  picker.on("emoji", (emoji) => {
    document.querySelector(`#input-add-comment-${id}`).value += emoji;
  });
}
