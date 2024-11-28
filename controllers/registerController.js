const pool = require('../models/db.js');
const bcrypt = require('bcrypt');

/**
 * Controller to handle user registration (POST)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.register = async (req, res) => {
    try {
        // Extract user details from the request body
        console.log(req.body)
        const { username, password, institute, email } = req.body;

        if (!username || !email || !password || !institute) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        // Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user in db
        const query = 'INSERT INTO users (username, password_hash, institute, email) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [username, hashedPassword, institute, email];
        const result = await pool.query(query, values);

        res.status(201).json("User registered successfully.");
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
};
