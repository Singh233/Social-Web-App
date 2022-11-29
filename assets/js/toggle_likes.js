
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
                console.log(data.data.deleted);
                if (data.data.deleted === true) {
                    likesCount -= 1;
                } else {
                    likesCount += 1;
                }

                $(self).attr('data-likes', likesCount);
                $(self).html(`<i style="margin-left: 0px" class="fa-regular fa-heart"></i> <span>${likesCount}</span>`);
                
            })
            .fail(function(errorData) {
                console.log("error in completing the like request****");
            });
        });
    }
}