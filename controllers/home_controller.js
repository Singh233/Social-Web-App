const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');

module.exports.home = async function(request, response) {
    // Post.find({user: request.user._id}, function(error, post) {
    //     if (error) {
    //         console.log("Error finding user");
    //         return;
    //     }

    //     return response.render('home.ejs', {
    //         title: "Home",
    //         posts: post
    //     });
    // });


    // populate the user of each post
    try {
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user'
            },
            // populate: {
            //     path: 'likes'
            // }

        })
        // .populate('comments')
        .populate('likes');
    
        let users = await User.find({});
    
        return response.render('home.ejs', {
            title: "Home",
            posts: posts, 
            all_users: users
        });
    } catch(error) {
        console.log("Error", error);
        return;
    }
    
}
