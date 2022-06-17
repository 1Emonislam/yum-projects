const xhrUpload = (url, opts = {}, onProgress) => {
  return new Promise((res, rej) => {
    var xhr = new XMLHttpRequest()
    xhr.open(opts.method || 'get', url)
    for (var k in opts.headers || {}) xhr.setRequestHeader(k, opts.headers[k])
    xhr.onload = e => res(e.target)
    xhr.onerror = rej
    if (xhr.upload && onProgress) xhr.upload.onprogress = onProgress
    xhr.send(opts.body)
  })
}

export async function uploadFile(destinationUrl, file, onProgress = () => {}) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      resolve(xhr.response)
    }
    xhr.onerror = function (e) {
      console.log(e)
      reject(new TypeError('Network request failed'))
    }
    xhr.responseType = 'blob'
    xhr.open('GET', file, true)
    xhr.send(null)
  })

  const uploadResponse = await xhrUpload(
    destinationUrl,
    {
      method: 'put',
      body: blob,
    },
    progressEvent => {
      onProgress(progressEvent)
    }
  )

  blob.close()

  return uploadResponse.status === 200
}
