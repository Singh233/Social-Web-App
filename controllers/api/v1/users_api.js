const User = require('../../../models/user');
const Post = require('../../../models/post');
const Friendships = require('../../../models/friendship');
const jwt = require('jsonwebtoken');
const { use } = require('passport');
const env = require('../../../config/environment');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = env.google_clientID;
const client = new OAuth2Client(CLIENT_ID);
const crypto = require('crypto');

module.exports.createSession = async function (request, response) {

    try {
        console.log('request.body: ', request.body);
        let user = await User.findOne({ email: request.body.email });

        if (!user || user.password != request.body.password) {
            console.log(user)
            return response.json(422, {
                message: 'Invalid username or password!',
            });
        }

        // expires in 11 days
        let expiresIn = 11 * 24 * 60 * 60 * 1000;
        // console.log('user: ', user);
        return response.json(200, {
            message:
                'Sign in successfull, here is your token, please keep it safe!',
            success: true,
            data: {
                token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn }), //
                user: user,
            },
        });
    } catch (error) {
        console.log('******* ', error);
        return response.json(500, {
            message: 'Internal Server Error',
        });
    }
};

// profile
module.exports.profile = async function (request, response) {
    try {
        let user = await User.findById(request.params.id);
        let posts = await Post.find({ user: user._id }).sort('-createdAt');


        let followers = await Friendships.find({ to_user: user._id }).populate(
            'from_user'
        );


        let following = await Friendships.find({
            from_user: user._id,
        }).populate(
            {
                path: 'to_user',
                
            }
        );


        user.posts = posts;
        user.followers = followers;
        user.following = following;
        return response.json(200, {
            message: 'User profile',
            success: true,
            data: {
                user: user,
            },
        });
    } catch (error) {
        console.log('******* ', error);
        return response.json(500, {
            message: 'Internal Server Error',
        });
    }
};

// Create user
module.exports.create = async function (request, response) {
    try {
        let user = await User.findOne({ email: request.body.email });

        if (!user) {
            let newUser = await User.create(request.body);

            // expires in 11 days
            let expiresIn = 11 * 24 * 60 * 60 * 1000;
            // console.log('user: ', user);
            return response.json(200, {
                message: 'Sign up successfull',
                success: true,
                data: {
                    token: jwt.sign(user.toJSON(), env.jwt_secret, {
                        expiresIn,
                    }), //
                    user: newUser,
                },
            });
        } else {
            return response.status(200).json({
                message: 'You have already signed up, please login',
                success: false,
            });
        }
    } catch (error) {
        console.log('******* ', error);
        return response.json(500, {
            message: 'Internal Server Error',
        });
    }
};

module.exports.createGoogleSession = async function (request, response) {
    try {
        let token = request.headers.authorization.split(' ')[1];
        if (token == null) {
            return response.json(401, {
                message: 'Unauthorized',
                });
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, name, email, picture } = payload;

        let user = await User.findOne({email: email});

        if (!user) {
            user = await User.create({
                // if not found create the user and set it as req.user
                name: name,
                email: email,
                password: crypto.randomBytes(20).toString('hex')
            });
        }
        

        if (!user) {
            return response.json(422, {
                message: 'Invalid username or password!',
            });
        }

        // expires in 11 days
        let expiresIn = 11 * 24 * 60 * 60 * 1000;
        // console.log('user: ', user);
        return response.json(200, {
            message:
                'Sign in successfull, here is your token, please keep it safe!',
            success: true,
            data: {
                token: jwt.sign(user.toJSON(), env.jwt_secret, { expiresIn }), //
                user: user,
            },
        });
    } catch (error) {
        console.log('******* ', error);
        return response.json(500, {
            message: 'Internal Server Error',
        });
    }
};


module.exports.destroySession = function(request, response) {

    return response.json(200, {
        success: true,
        message: "Sign out successfull"
    });
}

// fetch user friends
module.exports.fetchUserFriends = async function (request, response) {
    try {
        let user = await User.findById(request.user.id);
        
        // find all the friendships where the user is the from_user and populate the posts, followers and following of the to_user
        let friendships = await Friendships.find({from_user: user._id}).populate({
            path: 'to_user',
        });
        for (let i = 0; i < friendships.length; i++) {
            let posts = await Post.find({user: friendships[i].to_user._id}).sort('-createdAt');
            let followers = await Friendships.find({to_user: friendships[i].to_user._id}).populate('from_user');
            let following = await Friendships.find({from_user: friendships[i].to_user._id}).populate('to_user');

            friendships[i].to_user.posts = posts;
            friendships[i].to_user.followers = followers;
            friendships[i].to_user.following = following;
        }

        // console.log('friends: ', friendships)

        return response.json(200, {
            message: 'User friends',
            success: true,
            data: {
                friends: friendships,
            },
        });
    } catch (error) {
        console.log('******* ', error);
        return response.json(500, {
            message: 'Internal Server Error',
        });
    }
}