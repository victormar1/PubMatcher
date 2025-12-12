const crypto = require('crypto')
const bcrypt = require('bcrypt')
const pool = require('../models/db')

// Validate the reset token
exports.validateToken = async (req, res) => {
  const { token } = req.params

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Check if the token exists in the database
    const result = await pool.query(`SELECT * FROM users WHERE reset_password_token = $1`, [hashedToken])

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' })
    }

    res.status(200).json({ message: 'Valid token. Proceed to reset your password.' })
  } catch (error) {
    console.error('Error validating password reset token:', error)
    res.status(500).json({ error: 'An error occurred while validating the token.' })
  }
}

// Reset the password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Check if the token exists in the database
    const result = await pool.query(`SELECT * FROM users WHERE reset_password_token = $1`, [hashedToken])

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' })
    }

    const user = result.rows[0]
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the password and clear the reset token
    await pool.query(
      `
      UPDATE users
      SET password_hash = $1, reset_password_token = NULL
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    )

    res.status(200).json({ message: 'Password reset successful.' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ error: 'An error occurred while resetting the password.' })
  }
}
