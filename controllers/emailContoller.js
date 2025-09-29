const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  const path = require('path');
  
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ifeanyivalentine82@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Your Order Status 🛒" ifeanyivalentine82@gmail.com', // sender address
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htmt,
    attachments: [{
      filename: 'logo.svg',
      path: path.join(__dirname, '../assets/logo.svg'),
      cid: 'logo'
    }]
  });
});

module.exports = sendEmail;
