
{
    
            const button = document.querySelector('.emoji-button');
            const picker = new EmojiButton({
                theme: 'dark'
            });
            
            button.addEventListener('click', () => {
                console.log("Clicked emoji", button);
            
                picker.togglePicker(button);
            });
            
            picker.on('emoji', emoji => {
                document.querySelector('#input-add-comment').value += emoji;
            });
        
}
