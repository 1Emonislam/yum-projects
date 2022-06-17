import * as Sentry from 'sentry-expo'
import { useState } from 'react'
import { graphQLClient } from '../../services'
import { gql } from 'graphql-request'

import { uploadFile } from '../../services'
import getFileParams from './getFileParams'

export function useUploadPhoto() {
  const [uploadingState, setUploadingState] = useState({
    isInProgress: false,
    isUploaded: false,
    loaded: 0,
    total: 0,
  })

  const handleProgress = event => {
    setUploadingState({
      isInProgress: event.loaded > 0,
      isUploaded: event.loaded === event.total,
      loaded: event.loaded,
      total: event.total,
    })
  }

  const upload = async (photo, type = 'photo') => {
    const { filename, filetype } = getFileParams(photo)

    try {
      const {
        result: { signedUrl, previewUrl },
      } = await graphQLClient.request(
        gql`
          mutation getUploadUrl(
            $filename: String!
            $filetype: String!
            $type: String!
          ) {
            result: createUploadUrl(
              filename: $filename
              filetype: $filetype
              type: $type
            ) {
              previewUrl
              filename
              signedUrl
            }
          }
        `,
        { filename, filetype, type }
      )

      console.log({ signedUrl, previewUrl })

      const presignedUploadUrl = signedUrl

      await uploadFile(presignedUploadUrl, photo, handleProgress)

      return previewUrl
    } catch (error) {
      Sentry.Native.captureException(error, scope => {
        scope.setTransactionName('useUploadPhoto')
        scope.setContext('error', error)
        scope.setContext('photo', photo)
      })
    }
  }

  return { upload, uploadingState }
}

export { getFileParams }
