const { Logtail } = require('@logtail/node')
const { LogtailTransport } = require('@logtail/winston')
const winston = require('winston')
require('winston-daily-rotate-file')

const logtail = new Logtail(process.env.LOGTAIL_TOKEN, {
  endpoint: 'https://s1179820.eu-nbg-2.betterstackdata.com'
})

const logger = winston.createLogger({
  transports: [new LogtailTransport(logtail)]
  // new winston.transports.Console({ format: winston.format.simple() })]
})

module.exports = logger
