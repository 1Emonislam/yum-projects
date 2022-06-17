export default function getFileParams(photo) {
  return {
    filename: photo.name,
    filetype: photo.type,
  }
}
