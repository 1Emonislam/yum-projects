const loginSchema = {
  body: {
    type: 'object',
    required: ['phoneNumber', 'code'],
    properties: {
      phoneNumber: { type: 'string' },
      code: { type: 'string' },
    },
  },
}

const requestPasswordResetSchema = {
  body: {
    type: 'object',
    required: ['phoneNumber'],
    properties: {
      phoneNumber: { type: 'string' },
    },
  },
}

const resetPasswordSchema = {
  body: {
    type: 'object',
    required: ['phoneNumber', 'password', 'otpCode'],
    properties: {
      phoneNumber: { type: 'string' },
      password: { type: 'string' },
      otpCode: { type: 'string' },
    },
  },
}

module.exports = {
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
}
