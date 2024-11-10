// controllers/reportBugController.js

/**
 * Controller pour gérer les rapports de bugs
 * @param {Request} req - Objet requête Express
 * @param {Response} res - Objet réponse Express
 */
exports.reportBug = (req, res) => {
    console.log('Received /reportbug request');

    const { name, message } = req.body;
    console.log('Bug report data:', { name, message });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Bug Report from Pubmatcher',
        text: `Name: ${name}\n\nMessage: ${message}`
    };

    console.log('Mail Options:', mailOptions);

    // Accéder au transporteur depuis les locals de l'application
    const transporter = req.app.locals.transporter;

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent');
        }
    });
};


