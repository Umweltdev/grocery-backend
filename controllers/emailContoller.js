const nodemailer = require("nodemailer");

const sendEmail = async (data) => {
  const path = require('path');
  
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ifeanyivalentine82@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: '"Kacco Cash Store 🛒" <ifeanyivalentine82@gmail.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.htm,
      attachments: [{
        filename: 'logo.svg',
        path: path.join(__dirname, '../assets/logo.svg'),
        cid: 'logo'
      }]
    });
    
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;