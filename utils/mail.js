import nodemailer from "nodemailer";
import {
  EMAIL_AUTH_FROM,
  EMAIL_AUTH_PASSWORD,
  EMAIL_AUTH_USER,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SSL,
} from "./constant.js";

var transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SSL ? true : false,
  auth: {
    user: EMAIL_AUTH_USER,
    pass: EMAIL_AUTH_PASSWORD,
  },
});

const sendEmail = ({ to, subject, text, html }) => {
  var mailOptions = {
    from: EMAIL_AUTH_FROM,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Not Working!! TRY SOMETHING NEW" + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export default sendEmail;
