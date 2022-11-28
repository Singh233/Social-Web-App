const nodeMailer = require('../config/nodemailer');



// This is another way of exporting a method
exports.newComment = (comment) => {
    console.log("Inside new comment mailer");
    console.log(comment.user.email);
    nodeMailer.transporter.sendMail({
        from: 'codeialDevelopment',
        to: comment.user.email,
        subject: 'New Comment added!',
        html: '<h1> Yup, your comment is not published</h1>'
    }, (error, info) => {
        if (error) {
            console.log('Error in sending the mail,', error);
            return;
        }

        console.log('Mail delivered', info);
        return;
    })
}