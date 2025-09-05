const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
  auth: {
    user: "riliwanademola72@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
},
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Hey 👻" <Abdulsalam@gmail.com.com>', // sender address
    to: data.to, 
    subject: data.subject,
    text: data.text, 
    html: data.htmt, 
  });
});

module.exports = sendEmail;