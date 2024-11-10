// config/server.js
const fs = require('fs');
const https = require('https');
const http = require('http');

function configureServer(app) {
    const mode = process.env.NODE_ENV || 'development';
    console.log(`Server is starting in ${mode} mode...`);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        const privateKeyPath = '/etc/letsencrypt/live/pubmatcher.fr/privkey.pem';
        const certificatePath = '/etc/letsencrypt/live/pubmatcher.fr/fullchain.pem';

        const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        const certificate = fs.readFileSync(certificatePath, 'utf8');
        const credentials = { key: privateKey, cert: certificate };

        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(443, () => {
            console.log(`Running on https://localhost:443`);
        });
    } else {
        const httpServer = http.createServer(app);
        httpServer.listen(3000, () => {
            console.log('Running on http://localhost:3000');
        });
    }
}

module.exports = { configureServer };
