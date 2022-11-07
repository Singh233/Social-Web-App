module.exports.profile = function(request, response) {
    return response.render('user_profile.ejs', {
        title: "Profile"
    });
}