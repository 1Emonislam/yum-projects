/**
 * Allows a user to request an OTP to be used to reset their password.
 */
const moment = require('moment-timezone')
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber')
const { sendSMSTextMessage } = require('../services/AfricasTalking')

const requestPasswordResetOTP = async (request, reply, client, app) => {
  const body = request.body
  const { phoneNumber: rawParamPhoneNumber } = body
  const phoneNumber = normalizePhoneNumber(rawParamPhoneNumber)
  const { eventProcessor } = app

  try {
    if (phoneNumber !== '') {
      // TODO: In future we need to do some sort of API rate limiting to prevent
      // automated (brute force/dictionary, etc) attacks from overwhelming our db.
      const user = await client
        .db()
        .collection('users')
        .findOne({ fullPhoneNumber: phoneNumber })

      if (user) {
        let digits = process.env.OTP_SMS_CODE_LENGTH
        if (!digits) digits = 6
        const [_, otpCode] = Math.random().toFixed(digits).split('.')

        const sendPasswordResetOTPEvent = {
          type: 'update',
          obj: 'user',
          objId: user._id,
          payload: {
            resetPasswordOTP: {
              otp: `${otpCode}`,
              expiresAt: moment().add(15, 'minutes').toDate(), // 15 minutes validity
            },
          },
          timestamp: new Date(),
        }

        sendSMSTextMessage(
          phoneNumber,
          `Your password reset code is: ${otpCode}`
        )
        await eventProcessor.addEvent(sendPasswordResetOTPEvent)

        reply.send({ success: true })

        return
      }
      await eventProcessor.addEvent({
        payload: {
          phoneNumber,
          userId: null,
          isSuccessful: false,
          authEventSource: 'requestPasswordReset',
        },
        type: 'create',
        timestamp: new Date(),
      })
    }

    reply.code(401).type('text/plain').send('User not found')

    return
  } catch (error) {
    await eventProcessor.addEvent({
      payload: {
        phoneNumber,
        userId: null,
        authEventSource: 'requestPasswordReset',
        isSuccessful: false,
      },
      type: 'create',
      timestamp: new Date(),
    })

    reply.code(401).type('text/plain').send('Something went wrong')

    return
  }
}

module.exports = requestPasswordResetOTP
