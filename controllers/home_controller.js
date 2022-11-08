module.exports.home = function(request, response) {
    return response.render('home.ejs', {
        title: "Home"
    });
}