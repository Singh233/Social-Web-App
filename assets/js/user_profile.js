
function toggleFollow(event) {
    // get the element on which the event is fired
    let self = $(event.target);
    
    if (self.html() === 'Follow') {
        $.ajax({
            type: 'get',
            url: `/users/friends/add?from=${self.attr('data-from')}&to=${self.attr('data-to')}`,
            success: function(data) {
                self.html('Unfollow');

                // update the number of followers
                let followersCount = parseInt($('#followers-count').html());
                $('#followers-count').html(followersCount + 1);

                // create a new notification
                Toastify({
                    text: 'You are now following ' + data.data.toUserName,
                    duration: 2000,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",
    
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#0057D2",
                        borderRadius: "10px",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            },
            error: function(error) {
                console.log(error.responseText);

                Toastify({
                    text: 'Something went wrong!',
                    duration: 2000,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#D20A0A",
                        borderRadius: "10px",
                        color: "white",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            }
        })
    } else if (self.html() === 'Unfollow'){
        $.ajax({
            type: 'get',
            url: `/users/friends/remove?from=${self.attr('data-from')}&to=${self.attr('data-to')}`,
            success: function(data) {
                self.html('Follow');

                // update the number of followers
                let followersCount = parseInt($('#followers-count').html());
                $('#followers-count').html(followersCount - 1);

                // create a new notification
                Toastify({
                    text: 'You have unfollowed ' + data.data.toUserName,
                    duration: 2000,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: "https://cdn-icons-png.flaticon.com/512/845/845646.png?w=1480&t=st=1680445326~exp=1680445926~hmac=0cb88a0841456c7c4b22ff6c8b911a3acb1e1278095990a5368ab134203fb03d",
    
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#0057D2",
                        borderRadius: "10px",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            },
            error: function(error) {
                console.log(error.responseText);

                Toastify({
                    text: 'Something went wrong!',
                    duration: 2000,
                    destination: "",
                    newWindow: true,
                    close: true,
                    avatar: "https://cdn-icons-png.flaticon.com/512/1160/1160303.png?w=1480&t=st=1680445542~exp=1680446142~hmac=c9f4eeb27a966c0a92628d64cc93b6d47b8b8d4d2834ba1930357bf0bf47c1e9",
                    gravity: "top", // `top` or `bottom`
                    position: "center", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "#D20A0A",
                        borderRadius: "10px",
                        color: "white",
                    },
                    onClick: function(){} // Callback after click
                }).showToast();
            }
        })
    }
}

