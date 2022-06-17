const { ObjectId } = require('mongodb')
const jwt_decode = require('jwt-decode')

const session = async (request, reply, client, app) => {
  try {
    await request.jwtVerify()

    const token = request.headers.authorization.replace('Bearer ', '')

    const { type, _id, role } = jwt_decode(token)

    if (type === 'refresh' && _id && role) {
      const user = await client
        .db()
        .collection('users')
        .findOne({
          _id: ObjectId(_id),
          role: role,
        })

      if (user) {
        const access_token = app.jwt.sign(
          {
            type: 'access',
            user_data: {
              _id: user._id.toString(),
              branchId: user.branchId ? user.branchId.toString() : null,
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
  } catch (err) {
    console.error(err)
    // Ignore
  }

  reply.code(401).type('text/plain').send('Unauthenticated')
}

module.exports = session
