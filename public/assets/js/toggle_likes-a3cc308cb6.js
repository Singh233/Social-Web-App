class ToggleLike{constructor(t){this.toggler=t,this.toggleLike()}toggleLike(){$(this.toggler).click((function(t){t.preventDefault();let e=this;$.ajax({type:"POST",url:$(e).attr("href")}).done((function(t){let l=parseInt($(e).attr("data-likes"));console.log(t.data.deleted),!0===t.data.deleted?l-=1:l+=1,$(e).attr("data-likes",l),$(e).html(`<i style="margin-left: 0px" class="fa-regular fa-heart"></i> <span>${l}</span>`)})).fail((function(t){console.log("error in completing the like request****")}))}))}}