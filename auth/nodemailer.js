'use strict';
const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.googlemail.com', // Gmail Host
        port: 465, // Port
        secure: true, // this is true as port is 465
        auth: {
            user: 'GMAIL_USERNAME', //Gmail username
            pass: 'GMAIL_PASSWORD' // Gmail password
        }
    });

    let mailOptions = {
        from: '"Artisans Web" <admin@artisansweb.net>',
        to: 'RECEPIENT_EMAIL_ADDRESS', // Recepient email address. Multiple emails can send separated by commas
        subject: 'Welcome Email',
        text: 'This is the email sent through Gmail SMTP Server.'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
});