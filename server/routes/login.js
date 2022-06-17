const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { normalizePhoneNumber } = require('../utils/normalizePhoneNumber')

// const axios = require('axios')
// const FormData = require('form-data')

const login = async (request, reply, client, app) => {
  const body = request.body
  const { phoneNumber: rawParamPhoneNumber, code } = body
  const phoneNumber = normalizePhoneNumber(rawParamPhoneNumber)
  const { eventProcessor } = app

  if (
    process.env.SIGNIN_SHORTCUTS === 'true' &&
    [
      '+2561100',
      '+2561101',
      '+2561102',
      '+2561103',
      '+2561104',
      '+2561105',
      '+2561106',
    ].includes(phoneNumber) &&
    ['1100', '1101', '1102', '1103', '1104', '1105', '1106'].includes(code)
  ) {
    const query = {
      fullPhoneNumber: String(phoneNumber)
        .replace('+2561100', '+256757514641')
        .replace('+2561101', '+256777083085')
        .replace('+2561102', '+256702563810')
        .replace('+2561103', '+48530830807')
        .replace('+2561104', '+256755745488')
        .replace('+2561105', '+256708561459')
        .replace('+2561106', '+256786085985'),
      isDisabled: { $ne: true },
    }

    const user = await client.db().collection('users').findOne(query)

    if (user) {
      const access_token = app.jwt.sign(
        {
          type: 'access',
          user_data: {
            _id: user._id.toString(),
            branchId: user.branchId ? user.branchId.toString() : null,
            branchIds: user.branchIds
              ? user.branchIds.map(branchId => branchId.toString())
              : [],
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
      )

      const refresh_token = app.jwt.sign(
        {
          type: 'refresh',
          _id: user._id.toString(),
          role: user.role,
        },
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
      )

      reply.send({ access_token, refresh_token })

      return
    }

    reply.code(401).type('text/plain').send('Unauthenticated')

    return
  }

  try {
    // const form = new FormData()

    // form.append('To', phoneNumber)
    // form.append('Code', code)

    // const response = await axios.post(
    //   `https://verify.twilio.com/v2/Services/${process.env.TWILIO_VERIFY_SID}/VerificationCheck`,
    //   form,
    //   {
    //     headers: {
    //       ...form.getHeaders(),
    //       Authorization: [`Basic ${process.env.TWILIO_TOKEN}`],
    //     },
    //   }
    // )

    // if (response?.data?.status === 'approved') {
    if (code !== '' && phoneNumber !== '') {
      // TODO: In future we need to do some sort of API rate limiting to prevent
      // automated (brute force/dictionary, etc) attacks from overwhelming our db.

      const user = await client
        .db()
        .collection('users')
        .findOne({ fullPhoneNumber: phoneNumber })

      const isSuccessful = await bcrypt.compare(code, user?.password)

      await eventProcessor.addEvent({
        payload: {
          phoneNumber,
          userId: user ? ObjectId(user._id) : null,
          isSuccessful,
          authEventSource: 'login',
        },
        type: 'create',
        timestamp: new Date(),
      })

      if (user && isSuccessful) {
        const access_token = app.jwt.sign(
          {
            type: 'access',
            user_data: {
              _id: user._id.toString(),
              branchId: user.branchId ? user.branchId.toString() : null,
              branchIds: user.branchIds
                ? user.branchIds.map(branchId => branchId.toString())
                : [],
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
            },
          },
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
        )

        const refresh_token = app.jwt.sign(
          {
            type: 'refresh',
            _id: user._id.toString(),
            role: user.role,
          },
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
        )

        reply.send({ access_token, refresh_token })

        return
      }
    }

    reply.code(401).type('text/plain').send('Unauthenticated')

    return
  } catch (error) {
    await eventProcessor.addEvent({
      payload: {
        phoneNumber,
        userId: null,
        authEventSource: 'login',
        isSuccessful: false,
      },
      type: 'create',
      timestamp: new Date(),
    })

    reply.code(401).type('text/plain').send('Unauthenticated')

    return
  }
}

module.exports = login
