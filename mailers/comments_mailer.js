const nodeMailer = require('../config/nodemailer');



// This is another way of exporting a method
exports.newComment = (comment) => {
    let htmlString = nodeMailer.renderTemplate({comment: comment}, '/comments/new_comment.ejs')
    console.log(comment.user.email);
    nodeMailer.transporter.sendMail({
        from: 'codeialDevelopment',
        to: comment.user.email,
        subject: 'New Comment added!',
        html: htmlString
    }, (error, info) => {
        if (error) {
            console.log('Error in sending the mail,', error);
            return;
        }

        console.log('Mail delivered');
        return;
    })
}