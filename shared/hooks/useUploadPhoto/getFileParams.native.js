export default function getFileParams(photoUri) {
  return {
    filename: photoUri.split('/').pop(),
    filetype: 'image/jpeg', // @FIXME
  }
}
