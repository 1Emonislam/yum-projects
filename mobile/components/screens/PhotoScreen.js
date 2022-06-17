import * as Sentry from 'sentry-expo'
import { Camera } from 'expo-camera'
import { Colors } from '@constants'
import {
  Image,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import * as Location from 'expo-location'
import { isDevice } from 'expo-device'
import { Text, ProgressBar } from 'react-native-paper'
import { useAuth, useUploadPhoto } from 'shared'
import * as ImageManipulator from 'expo-image-manipulator'
import AActivityIndicator from '@atoms/AActivityIndicator'
import AButton from '@atoms/AButton'
import ASafeAreaView from '@atoms/ASafeAreaView'
import React, { useEffect, useRef, useState } from 'react'
import { useHeader } from '@hooks'

const delay = ms => new Promise(res => setTimeout(res, ms))

export function PhotoScreen({ route, navigation }) {
  const ref = useRef()

  const { _id, firstName, lastName, role } = useAuth()

  const [label, setLabel] = useState()
  const [context, setContext] = useState()
  const [name, setName] = useState()
  const [confirmation, setConfirmation] = useState('Is this photo sharp?')
  const [fingerprint, setFingerprint] = useState(false)
  const [readOnly, setReadOnly] = useState(false)

  const [screen, setScreen] = useState(0)
  const [hasPermission, setHasPermission] = useState(null)
  const [picture, setPicture] = useState()
  const [pictureSize, setPictureSize] = useState()
  const [pictureInProgress, setPictureInProgress] = useState(false)
  const [pictureTaken, setPictureTaken] = useState(false)
  const [pictureConfirmed, setPictureConfirmed] = useState(false)
  const [photo, setPhoto] = useState()
  const [photoLoading, setPhotoLoading] = useState(false)

  const { upload, uploadingState } = useUploadPhoto()

  useEffect(() => {
    if (route.params) {
      const {
        label,
        context,
        name,
        screen,
        confirmation,
        photo,
        fingerprint,
        readOnly,
      } = route.params

      if (label) {
        setLabel(label)
      }

      if (context) {
        setContext(context)
      }

      if (name) {
        setName(name)
      }

      if (screen) {
        setScreen(screen)
      }

      if (confirmation) {
        setConfirmation(confirmation)
      }

      if (photo) {
        setPhoto(photo)
        setPhotoLoading(true)
      }

      if (fingerprint) {
        setFingerprint(true)
      }

      if (readOnly) {
        setReadOnly(true)
      }
    }
  }, [
    route.params,
    setLabel,
    setContext,
    setName,
    setScreen,
    setConfirmation,
    setPhoto,
    setFingerprint,
    setReadOnly,
  ])

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

  const onCameraReady = async () => {
    if (isDevice) {
      let sizes = await ref.current.getAvailablePictureSizesAsync('4:3')

      if (ref.current) {
        await delay(1000)

        await ref.current.pausePreview()
      }

      setPictureSize(sizes[0])

      if (ref.current) {
        await ref.current.resumePreview()
      }
    }
  }

  const onCameraTakePicture = async () => {
    setPictureInProgress(true)

    if (isDevice) {
      await delay(1000)

      let newPicture = await ref.current.takePictureAsync({
        exif: false,
        skipProcessing: true,
      })

      setPicture(newPicture)
    } else {
      console.log('Click')
    }

    setPictureTaken(true)
  }

  const onSubmit = async () => {
    setPictureConfirmed(true)

    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      navigation.goBack()
      return
    }

    let location
    let locationSuccess = false
    let locationError = false
    let locationErrorCatched
    let executionTimeInSeconds = 0

    const locationStartTime = new Date()

    while (!locationSuccess && !locationError) {
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })

        locationSuccess = true
      } catch (error) {
        locationErrorCatched = error
      }

      executionTimeInSeconds = (new Date() - locationStartTime) / 1000

      if (executionTimeInSeconds >= 30) {
        locationError = true
      }
    }

    if (locationError) {
      Sentry.Native.captureException(locationErrorCatched, scope => {
        scope.setTransactionName('PhotoScreen')
        scope.setContext(
          'error',
          locationErrorCatched || 'More than 30 seconds to get the location'
        )
        scope.setContext(
          'executionTimeInSeconds',
          String(executionTimeInSeconds)
        )
        scope.setUser({ id: _id })
      })

      navigation.goBack()
      return
    }

    const { latitude: lat, longitude: lng } = location.coords

    const optimizedPicture = await ImageManipulator.manipulateAsync(
      picture.uri,
      [
        { resize: { width: 1026, height: 1368 } },
        { crop: { height: 1026, originX: 0, originY: 0, width: 1026 } },
        { resize: { width: 1024, height: 1024 } },
      ],
      { compress: 0.8 }
    )

    const value = await upload(optimizedPicture.uri)

    const params = fingerprint
      ? {
          snackbar: `Fingerprint photo has been uploaded`,
          signature: {
            name,
            value,
          },
        }
      : {
          snackbar: `${label} has been uploaded`,
          photo: {
            name,
            value,
            lat: String(lat),
            lng: String(lng),
          },
        }

    navigation.navigate(screen, params)
  }

  const onCancel = () => {
    setPictureInProgress(false)
    setPictureTaken(false)
    setPictureConfirmed(false)
    setPicture(null)
  }

  const onRetake = () => {
    setPhoto(null)
  }

  useHeader({
    title:
      photo || pictureTaken
        ? fingerprint
          ? 'Fingerprint photo'
          : 'Photo'
        : `Take a ${fingerprint ? 'fingerprint' : ''} photo`,
    subtitle: context || label,
  })

  return (
    <ASafeAreaView>
      <View style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}>
        <View
          style={{
            background: Colors.placeholder,
            width: width,
            height: width,
            position: 'relative',
          }}
        >
          {hasPermission && (
            <View>
              {!picture && !photo && (
                <View style={{ overflow: 'hidden', height: width }}>
                  <Camera
                    ref={ref}
                    width={width}
                    height={width * (4 / 3)}
                    pictureSize={pictureSize}
                    ratio="4:3"
                    autoFocus={Camera.Constants.AutoFocus.On}
                    onCameraReady={onCameraReady}
                    useCamera2Api
                  ></Camera>
                </View>
              )}
              {picture && (
                <View style={{ overflow: 'hidden', height: width }}>
                  <Image
                    source={picture}
                    resizeMode="contain"
                    style={{ width: width, height: width * (4 / 3) }}
                  />
                </View>
              )}
              {photo && (
                <View>
                  {photoLoading && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                    >
                      <AActivityIndicator color={Colors.white} />
                    </View>
                  )}
                  <Image
                    source={{ uri: photo }}
                    resizeMode="contain"
                    style={{
                      backgroundColor: Colors.placeholder,
                      width: width,
                      height: width,
                    }}
                    onLoadEnd={() => setPhotoLoading(false)}
                  />
                </View>
              )}
            </View>
          )}
        </View>
        {photo && !readOnly && (
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <AButton mode="contained" onPress={onRetake}>
              Retake
            </AButton>
          </View>
        )}
        {!photo && (
          <View
            style={{
              flexGrow: 1,
              display: 'flex',
            }}
          >
            {!pictureTaken && (
              <View
                style={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {pictureInProgress && <AActivityIndicator />}
                {!pictureInProgress && (
                  <TouchableOpacity
                    activeOpacity={0.4}
                    onPress={onCameraTakePicture}
                  >
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
                )}
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
                <Text style={{ flexGrow: 1 }}>{confirmation}</Text>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  <AButton onPress={onCancel}>No, retake the photo</AButton>
                  <AButton onPress={onSubmit}>Yes</AButton>
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
                <View>
                  <ProgressBar
                    progress={
                      uploadingState.total > 0
                        ? uploadingState.loaded / uploadingState.total
                        : 0
                    }
                  />
                  <Text style={{ marginVertical: 32 }}>Uploading…</Text>
                  <AButton mode="contained" onPress={onCancel}>
                    Cancel
                  </AButton>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ASafeAreaView>
  )
}

export default PhotoScreen
