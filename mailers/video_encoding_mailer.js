const nodeMailer = require("../config/nodemailer");

// This is another way of exporting a method
exports.videoProcessed = (subject, html, email) => {
  nodeMailer.transporter.sendMail(
    {
      from: "info@chillsanam.com",
      to: email,
      subject: subject,
      html: html,
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
