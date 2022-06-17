/**
 * Sending SMS messages to users.
 */

const credentials = {
  apiKey: `${process.env.AFRICASTALKING_API_KEY}`,
  username: `${process.env.AFRICASTALKING_USERNAME}`,
}

const AfricasTalking = require('africastalking')(credentials)

const sms = AfricasTalking.SMS

function sendSMS(recipientsArray, message) {
  const options = {
    to: recipientsArray,
    message,
    from: `${process.env.AFRICASTALKING_SENDER_ID}`,
  }

  sms
    .send(options)
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log(err)
    })
}

/**
 * Sends a text message to the specified number.
 *
 * @param {*} recipient - SMS recipient number. e.g. +254711123456
 * @param {*} message - the message to be delivered
 * @returns undefined
 */
const sendSMSTextMessage = async (recipient, message) => {
  if (!recipient || !message) return

  console.log('[message]', message)

  sendSMS([recipient], message)
}

module.exports = {
  sendSMSTextMessage,
}
