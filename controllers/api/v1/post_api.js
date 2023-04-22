const Post = require('../../../models/post');
const Comment = require('../../../models/comment');
const Like = require('../../../models/like');
const User = require('../../../models/user');
const jwt = require('jsonwebtoken');
const env = require('../../../config/environment');
const fs = require('fs');
const path = require('path');

module.exports.index = async function (request, response) {
    let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
            },
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'likes',
            },
        })
        .populate('likes')
        ;

    console.log('posts request ******');

    return response.json(200, {
        message: 'List of posts',
        success: true,
        data: {
            posts: posts,
        },
    });
};

module.exports.createPost = async function (request, response) {

    try {
        let user = request.user;
        if (user) {
            
                Post.uploadedFile(request, response, async function (error) {

                    if (error) {
                        console.log('****** Multer Error: ', error);
                        return response.status(400).json({
                            message: 'Error uploading file',
                            success: false,
                            });
                    }

                    if (request.file) {
                        // this is saving the path of the uploaded file into the field in the user
                        let newPost = await Post.create({
                            content: request.body.content,
                            user: user._id,
                            myfile: Post.filePath + '/' + request.file.filename,
                        });

                        // populate the user of newPost
                        try {
                            await newPost.populate('user');
                        } catch (error) {
                            console.log('Error populating user:', error);
                        }

                        return response.status(200).json({
                            data: {
                                post: newPost,
                                success: 'Post created successfully!',
                            },
                            success: true,
                            message: 'Post created!',
                        });
                        
                    }

                    console.log('file not uploaded', request.file)

                    return response.status(400  ).json({
                        message: 'Error uploading file',
                        success: false,
                    })
                    
                });
            
        } else {   
            console.log('user unauthorized') 
            // if the user does not exist
            return response.status(401).send('Unauthorized');
        }
    } catch (error) {
        request.flash('error', 'Error creating post');
        console.log('error', error);
        return response.redirect('back');
    }
};

module.exports.destroy = async function (request, response) {
    try {            
        const user = request.user;
        // check if the user exists
        if (user) {
            let post = await Post.findByIdAndRemove(request.params.id);
            if (post.user._id == user.id) {

                // delete the associated likes for the post and all its comments' likes
                await Like.deleteMany({ likeable: post, onModel: 'Post' });
                await Like.deleteMany({ _id: { $in: post.comments } });
                await Comment.deleteMany({ post: request.params.id });

                if (post.myfile) {
                    // unlink the file from the filesystem
                    fs.unlinkSync(path.join(__dirname, '../../..', post.myfile));
                    console.log('file deleted successfully')
                }

                return response.status(200).json({
                    data: {
                        post: post,
                    },
                    message: 'Post and associated comments deleted successfully!',
                    success: true,
                });
            } else {
                return response.status(401).send('Unauthorized');
            }
        } 
        
        return response.status(401).send('Unauthorized');
    } catch (error) {
        console.log('error', error);
        return response.status(500).json({
            message: 'Internal Server Error',
        });
    }
};
