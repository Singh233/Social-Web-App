const nodeMailer = require("../config/nodemailer");

// This is another way of exporting a method
exports.newComment = (comment) => {
  const htmlString = nodeMailer.renderTemplate(
    { comment: comment },
    "/comments/new_comment.ejs"
  );
  nodeMailer.transporter.sendMail(
    {
      from: "info@chillsanam.social",
      to: comment.user.email,
      subject: "New Comment added!",
      html: htmlString,
    },
    (error, info) => {
      if (error) {
        console.log("Error in sending the mail,", error);
        return;
      }
      console.log("Mail delivered");
    }
  );
};
