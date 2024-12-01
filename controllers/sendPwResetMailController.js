const crypto = require('crypto')
const nodemailer = require('nodemailer')
const pool = require('../models/db') // Adjust to your database connection

const sendPwResetMailController = async (req, res) => {
  const { email } = req.body
  // Validate the email
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  try {
    // Check if the user exists in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }

    const user = result.rows[0]

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const tokenExpiration = new Date(Date.now() + 3600000) // Token expires in 1 hour

    // Save the hashed token and expiration in the database
    await pool.query(
      `
            UPDATE users
            SET reset_password_token = $1, reset_password_expires = $2
            WHERE email = $3
            `,
      [hashedToken, tokenExpiration, email]
    )

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net', // MX Plan SMTP server
      port: 465, // Use port 465 for SSL
      secure: true, // Set to true for SSL
      auth: {
        user: process.env.RESET_MAIL_ADRESS, // Your email address
        pass: process.env.RESET_MAIL_PASSWORD // Your email password
      }
    })

    // Create the reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`

    await transporter.sendMail({
      from: process.env.RESET_MAIL_ADRESS, // Sender address
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    })

    res.status(200).json({ message: 'Password reset email sent successfully.' })
  } catch (error) {
    console.error('Error sending password reset email:', error)
    res.status(500).json({ error: 'An error occurred while sending the reset email.' })
  }
}

module.exports = sendPwResetMailController