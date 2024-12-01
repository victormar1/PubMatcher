// config/nodemailer.js
const nodemailer = require('nodemailer');

function configureNodemailer(app) {
    const transporter = nodemailer.createTransport({
        host: 'ssl0.ovh.net', // MX Plan SMTP server
        port: 465, // Use port 465 for SSL
        secure: true, // Set to true for SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Make transporter available via app locals
    app.locals.transporter = transporter;
}

module.exports = configureNodemailer;
