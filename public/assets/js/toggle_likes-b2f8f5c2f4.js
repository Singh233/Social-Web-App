class ToggleLike{constructor(a){this.toggler=a,this.toggleLike()}toggleLike(){$(this.toggler).click((function(a){a.preventDefault();let t=this;$.ajax({type:"POST",url:$(t).attr("href")}).done((function(a){let e=parseInt($(t).attr("data-likes"));!0===a.data.deleted?(e-=1,$(t).attr("data-likes",e),$(t).html(`<i style="margin-left: 0px" class="fa-regular fa-heart animate__animated  animate__bounceIn"></i> <span class="animate__animated  animate__fadeIn">${e}</span>`)):(e+=1,$(t).attr("data-likes",e),$(t).html(`<i style="margin-left: 0px" class="fa-solid fa-heart animate__animated animate__flip liked"></i> <span class="animate__animated  animate__fadeIn">${e}</span>`))})).fail((function(a){console.log("error in completing the like request****")}))}))}}