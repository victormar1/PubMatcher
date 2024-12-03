// controllers/reportBugController.js
const { sendBugReportEmail } = require('../config/nodemailer')

exports.reportBug = async (req, res) => {
  console.log('Received /reportbug request')

  const { name, description } = req.body

  if (!name || !description) {
    return res.status(400).json({
      error: 'Both name and description are required.'
    })
  }

  try {
    await sendBugReportEmail(name, description)

    res.status(200).json({
      message: 'Bug report sent successfully.'
    })
  } catch (error) {
    console.error('Error sending bug report:', error)

    res.status(500).json({
      error: 'Failed to send the bug report. Please try again later.'
    })
  }
}
