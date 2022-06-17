/**
 * Allows a user to request an OTP to be used to reset their password.
 */
const bcrypt = require('bcrypt')
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber')

const resetPassword = async (request, reply, client, app) => {
  const body = request.body
  const {
    phoneNumber: rawParamPhoneNumber,
    password,
    otpCode: rawOtpCode,
  } = body
  const phoneNumber = normalizePhoneNumber(rawParamPhoneNumber)
  const { eventProcessor } = app

  const otpCode = String(rawOtpCode).trim()

  try {
    if (phoneNumber !== '' && password !== '' && otpCode !== '') {
      // TODO: In future we need to do some sort of API rate limiting to prevent
      // automated (brute force/dictionary, etc) attacks from overwhelming our db.
      const user = await client
        .db()
        .collection('users')
        .findOne({ fullPhoneNumber: phoneNumber })

      const resetPasswordOTP = user.resetPasswordOTP

      if (
        user &&
        resetPasswordOTP?.otp === otpCode &&
        resetPasswordOTP?.expiresAt > Date.now()
      ) {
        const passwordHash = await bcrypt.hash(password, 10)

        const resetPasswordEvent = {
          type: 'update',
          obj: 'user',
          objId: user._id,
          payload: {
            password: passwordHash,
            resetPasswordOTP: {
              otp: null,
              expiresAt: null,
            },
          },
          timestamp: new Date(),
        }

        await eventProcessor.addEvent(resetPasswordEvent)

        reply.send({ success: true, message: 'Password reset successfully' })

        return
      }
      await eventProcessor.addEvent({
        payload: {
          phoneNumber,
          userId: null,
          isSuccessful: false,
          authEventSource: 'resetPassword',
        },
        type: 'create',
        timestamp: new Date(),
      })
    }

    reply.send({ success: false, message: 'Incorrect phone number/OTP code' })

    return
  } catch (error) {
    await eventProcessor.addEvent({
      payload: {
        phoneNumber: body.phoneNumber,
        userId: null,
        authEventSource: 'resetPassword',
        isSuccessful: false,
      },
      type: 'create',
      timestamp: new Date(),
    })

    reply.code(401).type('text/plain').send('Something went wrong')

    return
  }
}

module.exports = resetPassword
