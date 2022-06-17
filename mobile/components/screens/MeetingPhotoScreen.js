import React, { useEffect, useRef, useState, useCallback } from 'react'
import { TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Camera } from 'expo-camera'
import { isDevice } from 'expo-device'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import { Colors } from '@constants'
import { useUploadPhoto } from 'shared'
import { useHeader } from '@hooks'

export function MeetingPhotoScreen({ navigation }) {
  const ref = useRef()

  const [hasPermission, setHasPermission] = useState(null)
  const [flashMode, setFlashMode] = useState(false)
  const [pictureSize, setPictureSize] = useState()
  const [pictureTaken, setPictureTaken] = useState(false)
  const [pictureConfirmed, setPictureConfirmed] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [photo, setPhoto] = useState(null)

  const width = useWindowDimensions().width

  useEffect(() => {
    // eslint-disable-next-line
    ;(async () => {
      if (isDevice) {
        const { status } = await Camera.requestCameraPermissionsAsync()
        setHasPermission(status === 'granted')
      } else {
        setHasPermission(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (ref.current) {
      const f = async () => {
        if (isDevice) {
          let sizes = await ref.current.getAvailablePictureSizesAsync('1:1')

          setPictureSize(sizes[0])
        }
      }

      f()
    }
  }, [ref])

  const { upload, uploadingState } = useUploadPhoto()

  const onPhotoTaken = async () => {
    if (isDevice) {
      let photo = await ref.current.takePictureAsync({
        quality: 0.5,
        exif: false,
      })

      setCapturedPhoto(photo)
    } else {
      console.log('Click')
    }

    setPictureTaken(true)
  }

  const onPictureConfirm = useCallback(async () => {
    if (!capturedPhoto) {
      return
    }

    setPictureConfirmed(true)

    await upload(capturedPhoto.uri)
  }, [capturedPhoto, upload])

  useHeader({
    title: pictureConfirmed ? 'Meeting photo' : 'Take a photo',
  })

  return (
    <ASafeAreaView>
      <View style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}>
        {hasPermission && (
          <Camera
            ref={ref}
            width={width}
            height={width}
            ratio="1:1"
            pictureSize={pictureSize}
            useCamera2Api={true}
            flashMode={
              flashMode
                ? Camera.Constants.FlashMode.torch
                : Camera.Constants.FlashMode.off
            }
          ></Camera>
        )}
        {!pictureTaken && (
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity activeOpacity={0.4} onPress={onPhotoTaken}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderWidth: 2,
                  borderColor: Colors.black,
                  borderRadius: 64,
                }}
              />
            </TouchableOpacity>
          </View>
        )}
        {pictureTaken && !pictureConfirmed && (
          <View
            style={{
              flexGrow: 1,
              paddingTop: 16,
              paddingLeft: 20,
              paddingRight: 16,
              paddingBottom: 16,
            }}
          >
            <Text style={{ flexGrow: 1 }}>
              Is this photo sharp and includes all clients in the frame?
            </Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <AButton onPress={() => setPictureTaken(false)}>
                No, retake the photo
              </AButton>
              <AButton onPress={onPictureConfirm}>Yes</AButton>
            </View>
          </View>
        )}
        {pictureTaken && pictureConfirmed && (
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {uploadingState.isInProgress && (
              <Text style={{ marginBottom: 24 }}>Uploading…</Text>
            )}
            {uploadingState.isUploaded && (
              <Text style={{ marginBottom: 24 }}>Uploaded.</Text>
            )}
            <AButton mode="contained" onPress={() => console.log('Retake')}>
              Retake
            </AButton>
          </View>
        )}
      </View>
    </ASafeAreaView>
  )
}

export default MeetingPhotoScreen
