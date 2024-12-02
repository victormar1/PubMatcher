const nodemailer = require('nodemailer')

// BUG REPORT TRANSPORTER
const bugReportTransporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net', // MX Plan SMTP server
  port: 465, // Use port 465 for SSL
  secure: true, // Set to true for SSL
  auth: {
    user: process.env.NOREPLY_USER,
    pass: process.env.NOREPLY_PASS
  }
})

// PASSWORD RESET TRANSPORTER
const passwordResetTransporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net', // MX Plan SMTP server
  port: 465, // Use port 465 for SSL
  secure: true, // Set to true for SSL
  auth: {
    user: process.env.NOREPLY_USER,
    pass: process.env.NOREPLY_PASS
  }
})

// BUG REPORT FUNCTION
async function sendBugReportEmail(reporterName, reportBody) {
  const adminEmail = process.env.ADMIN_USER // Email address of the admin
  const subject = `Bug Report from ${reporterName}`
  const text = `Bug report details:\n\n${reportBody}`
  const html = `
        <p><strong>Bug Report from:</strong> ${reporterName}</p>
        <p><strong>Details:</strong></p>
        <pre>${reportBody}</pre>
    `

  try {
    const info = await bugReportTransporter.sendMail({
      from: bugReportTransporter.options.auth.user, // Sender email
      to: adminEmail, // Admin email
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

// PASSWORD RESET FUNCTION
async function sendPasswordResetEmail(to, resetLink) {
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

module.exports = {
  sendBugReportEmail,
  sendPasswordResetEmail
}
