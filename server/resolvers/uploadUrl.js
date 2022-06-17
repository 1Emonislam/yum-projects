const getS3UploadPresignedUrl = require('../services/getS3UploadPresignedUrl')

const resolvers = {
  createUploadUrl: async (_, { filename, filetype, type }, { user }) => {
    console.log('Generating S3 Presigned URL for user', user._id)

    return getS3UploadPresignedUrl({ filename, filetype, type })
  },
}

module.exports = resolvers
