const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');
const fs = require('fs');
const path = require('path');

module.exports.createPost = async function (request, response) {
    if (request.user.id === request.params.id) {
        try {
            Post.uploadedFile(request, response, async function (error) {
                if (error) {
                    console.log('****** Multer Error: ', error);
                    request.flash('error', 'Error uploading file');
                    return response.redirect('back');
                }
                console.log('file ', request.file)

                if (request.file) {
                    // this is saving the path of the uploaded file into the field in the user
                    let newPost = await Post.create({
                        content: request.body.content,
                        user: request.user._id,
                        myfile: Post.filePath + '/' + request.file.filename,
                    });
                    // console.log(request.file);
                    // console.log(newPost);

                    request.flash('success', 'Post created Successfully');

                    // populate the user of newPost
                    try {
                        await newPost.populate('user');
                    } catch (error) {
                        console.log('Error populating user:', error);
                    }

                    if (request.xhr) {
                        return response.status(200).json({
                            data: {
                                post: newPost,
                                success: 'Post created successfully!',
                            },
                            success: true,
                            message: 'Post created!',
                        });
                    }
                }

                return response.redirect('back');
            });
        } catch (error) {
            request.flash('error', 'Error creating post');
            console.log('error', error);
            return response.redirect('back');

        }
    } else {
        return response.response.status(401).send('Unauthorized');
    }
};

module.exports.destroy = async function (request, response) {
    try {
        let post = await Post.findById(request.params.id);
        if (post.user == request.user.id) {
            //delete teh associated likes for the post and all its comments likes too
            await Like.deleteMany({ likeable: post, onModel: 'Post' });
            await Like.deleteMany({ _id: { $in: post.comments } });
            post.remove();
            await Comment.deleteMany({
                post: request.params.id,
            });

            // delete the file associated with the post
            if (post.myfile) {
                fs.unlinkSync(path.join(__dirname, '..', post.myfile));
            }

            if (request.xhr) {
                return response.status(200).json({
                    data: {
                        post_id: request.params.id,
                        success: 'Post deleted successfully!',
                    },
                    message: 'Post deleted!',
                });
            }
            return response.redirect('back');
        } else {
            request.flash('error', error);
            return response.redirect('back');
        }
    } catch (error) {
        console.log('Error ', error);
        return response.status(401).send('Unauthorized');
    }
};
