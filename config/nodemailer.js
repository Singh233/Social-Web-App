const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const env = require("./environment");

const transporter = nodemailer.createTransport(env.smtp);

const renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, "../views/mailers", relativePath),
    data,
    function (error, template) {
      if (error) {
        console.log("Error in rendering template", error);
        return;
      }
      mailHTML = template;
    }
  );

  return mailHTML;
};

module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate,
};
