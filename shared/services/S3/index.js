import axios from 'axios'

const getPresignedUrlUrl =
  'https://yx5s3grx2k.execute-api.us-east-1.amazonaws.com/dev/yamdev-upload'

export async function getS3UploadPresignedUrl({
  filename,
  filetype,
  type = 'photo',
} = {}) {
  const response = await axios({
    method: 'post',
    url: getPresignedUrlUrl,
    data: {
      filename,
      filetype,
      type,
    },
  })

  return response.data
}

export * from './uploadFile'
