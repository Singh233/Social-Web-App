
{
    
    const picker = new EmojiButton({
        theme: 'dark'
    });
    
    const button = document.querySelector('.emoji-button');
    
    
    button.addEventListener('click', () => {
        console.log("Clicked emoji", button);
    
        picker.togglePicker(button);
    });
    
    picker.on('emoji', emoji => {
        document.querySelector('#input-add-comment').value += emoji;
    });
        
}
