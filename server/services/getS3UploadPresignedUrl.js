const { ObjectId } = require('mongodb')
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  signatureVersion: 'v4',
})

module.exports = async function getS3UploadPresignedUrl({
  filename,
  filetype,
  type,
}) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${type}/${String(new ObjectId())}-${filename}`,
    ContentType: filetype,
    ACL: 'public-read',
    Expires: 3600,
  }

  const signedUrl = await s3.getSignedUrlPromise('putObject', params)

  const previewUrl = new URL(signedUrl)

  return {
    signedUrl,
    filename,
    previewUrl: `${previewUrl.origin}${previewUrl.pathname}`,
  }
}
