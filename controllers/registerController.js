const pool = require('../models/db.js')
const bcrypt = require('bcrypt')
const validator = require('validator')

exports.register = async (req, res) => {
  try {
    const { username, password, institute, email, role } = req.body

    // Validate required fields // dont use vue requirements
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' })
    }

    // Check for duplicate email
    const emailCheckQuery = 'SELECT * FROM users WHERE email = $1'
    const emailCheckResult = await pool.query(emailCheckQuery, [email])
    if (emailCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already in use.' })
    }
    // Trim and validate username
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters.' })
    }

    // Check for duplicate username
    const usernameCheckQuery = 'SELECT * FROM users WHERE username = $1'
    const usernameCheckResult = await pool.query(usernameCheckQuery, [trimmedUsername])
    if (usernameCheckResult.rows.length > 0) {
      return res.status(409).json({ error: 'Username is already taken.' })
    }

    // password rules
    if (password.length < 6 || password.length > 20 || !/\d/.test(password)) {
      return res.status(400).json({
        error: 'Password must be between 6 and 20 characters long and include at least one numeric character.'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert
    const query = 'INSERT INTO users (username, password_hash, institute, email, role) VALUES ($1, $2, $3, $4, $5) RETURNING *'
    const values = [trimmedUsername, hashedPassword, institute, email, role]
    const result = await pool.query(query, values)

    res.status(201).json({ message: 'User registered successfully.', userId: result.rows[0].id })
  } catch (error) {
    console.error('Error during registration:', error)

    // Check for specific database errors
    if (error.code === '23505') {
      // Unique constraint violation (PostgreSQL error code)  gpt stuff
      return res.status(409).json({ error: 'Username or email already exists.' })
    }

    res.status(500).json({ error: 'Failed to register user.' })
  }
}
