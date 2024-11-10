// config/nodemailer.js
const nodemailer = require('nodemailer');

function configureNodemailer(app) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Make transporter available via app locals
    app.locals.transporter = transporter;
}

module.exports = configureNodemailer;
