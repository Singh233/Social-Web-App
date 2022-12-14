
class ToggleLike {
    constructor(toggleElement) {

        this.toggler = toggleElement;
        this.toggleLike();
    }

    toggleLike() {
        $(this.toggler).click(function(e) {
            e.preventDefault();
            let self = this;

            $.ajax({
                type: 'POST',
                url: $(self).attr('href'),
            })
            .done(function(data) {
                let likesCount = parseInt($(self).attr('data-likes'));
                if (data.data.deleted === true) {
                    likesCount -= 1;
                    $(self).attr('data-likes', likesCount);
                    $(self)
                    .html(`<i style="margin-left: 0px" class="fa-regular fa-heart animate__animated  animate__bounceIn"></i> <span class="animate__animated  animate__fadeIn">${likesCount}</span>`);
                } else {
                    likesCount += 1;
                    $(self).attr('data-likes', likesCount);
                    $(self)
                    .html(`<i style="margin-left: 0px" class="fa-solid fa-heart animate__animated animate__flip liked"></i> <span class="animate__animated  animate__fadeIn">${likesCount}</span>`);
                }

                
            })
            .fail(function(errorData) {
                console.log("error in completing the like request****");
            });
        });
    }
}