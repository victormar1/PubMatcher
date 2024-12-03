const pool = require('../models/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;


exports.login = async (req, res) => {
    const { username, password } = req.body;

    console.log(SECRET_KEY)
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });q
        }
        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }


        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '1y' } // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email:user.email, institute:user.institute, role:user.role },
        });

    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login.' });
    }
};
