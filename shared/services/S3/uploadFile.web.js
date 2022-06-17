export async function uploadFile(
  destinationUrl,
  file,
  contentType = 'image/jpeg'
) {
  const response = await fetch(
    new Request(destinationUrl, {
      method: 'PUT',
      mode: 'cors',
      body: file,
      headers: new Headers({
        'Content-Type': contentType,
        // Origin: 'http://localhost:3000',
        'x-amz-acl': 'public-read',
      }),
    })
  )

  return response.status === 200
}
