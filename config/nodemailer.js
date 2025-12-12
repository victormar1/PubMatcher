const nodemailer = require('nodemailer')

// Check if email configuration is available
const isEmailConfigured = !!(process.env.NOREPLY_USER && process.env.NOREPLY_PASS)

if (isEmailConfigured) {
  console.log('Email integration enabled')
} else {
  console.log('Email integration disabled (NOREPLY_USER/NOREPLY_PASS not set)')
}

// Create transporters only if email is configured
let bugReportTransporter = null
let passwordResetTransporter = null

if (isEmailConfigured) {
  // BUG REPORT TRANSPORTER
  bugReportTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.NOREPLY_USER,
      pass: process.env.NOREPLY_PASS
    }
  })

  // PASSWORD RESET TRANSPORTER
  passwordResetTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.NOREPLY_USER,
      pass: process.env.NOREPLY_PASS
    }
  })
}

// General email sender function
async function sendEmail({ transporter, to, subject, text, html }) {
  if (!transporter) {
    console.warn('Email not sent - email integration is disabled')
    throw new Error('Email integration is not configured')
  }

  try {
    const info = await transporter.sendMail({
      from: transporter.options.auth.user,
      to,
      subject,
      text,
      html
    })
    console.log(`Email sent: ${info.messageId}`)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// Function to send a bug report email
async function sendBugReportEmail(reporterName, reportBody) {
  if (!bugReportTransporter) {
    console.warn('Bug report email not sent - email integration is disabled')
    throw new Error('Email integration is not configured')
  }

  const adminEmail = process.env.ADMIN_USER
  if (!adminEmail) {
    console.warn('Bug report email not sent - ADMIN_USER not set')
    throw new Error('Admin email is not configured')
  }

  const subject = `Bug Report from ${reporterName}`
  const text = `Bug report details:\n\n${reportBody}`
  const html = `
        <p><strong>Bug Report from:</strong> ${reporterName}</p>
        <p><strong>Details:</strong></p>
        <pre>${reportBody}</pre>
    `

  try {
    const info = await bugReportTransporter.sendMail({
      from: bugReportTransporter.options.auth.user,
      to: adminEmail,
      subject,
      text,
      html
    })
    console.log(`Bug report email sent: ${info.messageId}`)
    return info
  } catch (error) {
    console.error('Error sending bug report email:', error)
    throw error
  }
}

async function sendPasswordResetEmail(to, resetLink) {
  if (!passwordResetTransporter) {
    console.warn('Password reset email not sent - email integration is disabled')
    throw new Error('Email integration is not configured')
  }

  const subject = 'Password Reset Request'
  const text = `You requested a password reset. Use this link: ${resetLink}`
  const html = `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`
  return sendEmail({
    transporter: passwordResetTransporter,
    to,
    subject,
    text,
    html
  })
}

// Export configuration status for other modules to check
module.exports = {
  sendBugReportEmail,
  sendPasswordResetEmail,
  isEmailConfigured
}
