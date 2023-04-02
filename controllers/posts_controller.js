const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');


module.exports.createPost = async function(request, response) {
    if (request.user.id == request.params.id) {

        try {
            
            Post.uploadedFile(request, response, function(error) {
                if (error) {
                    console.log('****** Multer Error: ', error);
                }
                
                if (request.file) {
                    // this is saving the path of the uploaded file into the field in the user
                    Post.create({
                        content: request.body.content,
                        user: request.user._id,
                        myfile: Post.filePath + '/' + request.file.filename
                    });
                    
                }
                request.flash('success', 'Post created Successfully');
                return response.redirect('back');
            });

            // let posts = await Post.find({_id: post._id})
            // .populate('user')
            // .populate({
            //     path: 'comments',
            //     populate: {
            //         path: 'user'
            //     }
            // });
        

            // if (request.xhr) {
            //     return response.status(200).json({
            //         data: {
            //             post: posts[0],
            //             success: 'Post created successfully!'
            //         },
            //         message: "Post created!"
            //     })
            // }
            
        } catch(error) {
            request.flash('error', error);
            console.log("error", error);
        }
    } else {
        return response.response.status(401).send("Unauthorized");
    }
    
}

module.exports.destroy = async function(request, response) {
    try {
        let post = await Post.findById(request.params.id);
        if (post.user == request.user.id) {
            //delete teh associated likes for the post and all its comments likes too
            await Like.deleteMany({likeable: post, onModel: 'Post'});
            await Like.deleteMany({_id: {$in: post.comments}})


            post.remove();

            await Comment.deleteMany({
                post: request.params.id
            });
            if (request.xhr) {
                return response.status(200).json({
                    data: {
                        post_id: request.params.id,
                        success: 'Post deleted successfully!'
                    },
                    message: "Post deleted!"
                });
            }
            return response.redirect('back');
        } else {
            request.flash('error', error);
            return response.redirect('back');
        }
    } catch(error) {
        console.log("Error ", error);
        return response.status(401).send('Unauthorized');

    }
    

}