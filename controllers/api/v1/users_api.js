const User = require('../../../models/user');
const Post = require('../../../models/post');
const Friendships = require('../../../models/friendship');
const jwt = require('jsonwebtoken');
const { use } = require('passport');
const env = require('../../../config/environment');

module.exports.createSession = async function(request, response) {
    try {
        let user = await User.findOne({email: request.body.email});

        if (!user || user.password != request.body.password) {
            return response.json(422, {
                message: 'Invalid username or password!'
            });
        } 

        // find posts of user
        let posts = await Post.find({user: user._id}).sort('-createdAt');

        // find followers of user and populate from_user
        let followers = await Friendships.find({to_user: user._id})
            .populate('from_user');

        // find following of user
        let following = await Friendships.find({from_user: user._id}   )
            .populate('to_user')
                    ;
        
        user.posts = posts;
        user.followers = followers;
        user.following = following;




        // expires in 11 days
        let expiresIn = 11 * 24 * 60 * 60 * 1000;
        // console.log('user: ', user);
        return response.json(200, {
            message: 'Sign in successfull, here is your token, please keep it safe!',
            success: true,
            data: {
                token: jwt.sign(user.toJSON(), env.jwt_secret, {expiresIn}), // 
                user: user,
            }
        })
    } catch (error) {
        console.log("******* ", error);
        return response.json(500, {
            message: "Internal Server Error"
        });
    }
    
}

// profile
module.exports.profile = async function(request, response) {
    try {
        let user = await User.findById(request.params.id);
        let posts = await Post.find({user: user._id}).sort('-createdAt');
        let followers = await Friendships.find({to_user: user._id}).populate('from_user');
        let following = await Friendships.find({from_user: user._id}).populate('to_user');
        user.posts = posts;
        user.followers = followers;
        user.following = following;
        return response.json(200, {
            message: 'User profile',
            success: true,
            data: {
                user: user,
            }
        })
    } catch (error) {
        console.log("******* ", error);
        return response.json(500, {
            message: "Internal Server Error"
        });
    }
}