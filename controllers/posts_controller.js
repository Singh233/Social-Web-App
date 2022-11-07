module.exports.posts = function(request, response) {
    return response.render('posts.ejs', {
        title: "Posts"
    });
}