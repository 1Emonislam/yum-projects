const axios = require('axios')
const FormData = require('form-data')

const initAuth = async (request, reply, client) => {
  const body = request.body

  if (process.env.SIGNIN_SHORTCUTS === 'true') {
    if (
      ['+2561100', '+2561101', '+2561102', '+2561104', '+2561105'].includes(
        body.phoneNumber
      )
    ) {
      reply
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ success: true })

      return
    }

    if (
      ['+2561103', '+2561106'].includes(body.phoneNumber) &&
      body.source === 'web'
    ) {
      reply
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({ success: true })

      return
    }
  }

  const user = await client
    .db()
    .collection('users')
    .findOne({ fullPhoneNumber: body.phoneNumber, isDisabled: { $ne: true } })

  if (
    body.source === 'mobile' &&
    ((user && user.role === 'admin') ||
      ['+2561103', '+2561106'].includes(body.phoneNumber))
  ) {
    reply
      .code(401)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ success: false, message: 'Admin' })

    return
  } else if (!user) {
    reply
      .code(401)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send({ success: false, message: 'User not found' })

    return
  }

  // try {
  //   const form = new FormData()

  //   form.append('To', body.phoneNumber)
  //   form.append('Channel', 'sms')
  //   form.append('Locale', 'en')

  //   await axios.post(
  //     `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/Verifications`,
  //     form,
  //     {
  //       headers: {
  //         ...form.getHeaders(),
  //         Authorization: [`Basic ${process.env.TWILIO_TOKEN}`],
  //       },
  //     }
  //   )

  reply
    .header('Content-Type', 'application/json; charset=utf-8')
    .send({ success: true })

  return
  // } catch (error) {
  //   reply
  //     .code(401)
  //     .header('Content-Type', 'application/json; charset=utf-8')
  //     .send({ success: false })

  //   return
  // }
}

module.exports = initAuth
