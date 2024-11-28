const jwt = require('jsonwebtoken');
const SECRET_KEY = 'changeThisBeforeProd'; // Replace with a secure key

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }

        req.user = user; // Attach user data from token to the request object
        next(); // Allow access to the next middleware or route handler
    });
};
module.exports = authenticateToken;
