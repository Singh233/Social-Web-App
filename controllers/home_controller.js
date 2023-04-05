const Post = require('../models/post');
const User = require('../models/user');
const Comment = require('../models/comment');
const Friendships = require('../models/friendship');
const env = require('../config/environment');

module.exports.redirectToHome = function(request, response) {
    return response.redirect('/home');
}

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
        .populate('likes');

        // populate the comments of each post
        for (let post of posts) {
            let comments = await Comment.find({post: post._id})
            .populate('user')
            .populate('likes');
            post.comments = comments;
        }
    
        let users = await User.find({});
        let friendsArray = [];
        if (request.user) {
            let friends = await Friendships.find({from_user: request.user._id});
            
            for (let friend of friends) {
                let currUser = await User.find({_id: friend.to_user});
                friendsArray.push(currUser);
            }
            
        }

        console.log(env.websocket_host)
        return response.render('home.ejs', {
            title: "Home",
            posts: posts, 
            all_users: users,
            friends: friendsArray,
            websocket_host: env.websocket_host
        });
    
        
    } catch(error) {
        console.log("Error", error);
        return;
    }
    
}
