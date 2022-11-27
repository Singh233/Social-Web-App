const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const FILE_PATH = path.join('/uploads/users/posts');

const postSchema = new mongoose.Schema({
    myFile: {type: String},
    content: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    // include the array of ids of all comments in this post schema itself
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Comment'
        }
    ]

}, {
    timestamps: true
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', FILE_PATH))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

// static methods

postSchema.statics.uploadedFile = multer({ 
    storage: storage, 
    fileFilter: (req, file, cb) => {
        const validFileTypes = /jpg|jpeg|png/ // Create regex to match jpg and png

        // Do the regex match to check if file extenxion match
        const extname = validFileTypes.test(path.extname(file.originalname).toLowerCase())

        if(extname === true){
            // Return true and file is saved
            return cb(null, true)
        }else{
            // Return error message if file extension does not match
            return cb("Error: Images Only!")
            }
        }
}).single('myFile');
postSchema.statics.filePath = FILE_PATH;


const Post = mongoose.model('Post', postSchema);

module.exports = Post;