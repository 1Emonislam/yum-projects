import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Camera } from 'expo-camera'
import { isDevice } from 'expo-device'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import ATextInput from '@atoms/ATextInput'
import { Colors } from '@constants'
import { useHeader } from '@hooks'

export function MeetingAttendanceManualScreen({ navigation }) {
  const ref = useRef()

  const [hasPermission, setHasPermission] = useState(null)
  const [flashMode, setFlashMode] = useState(false)
  const [pictureSize, setPictureSize] = useState()
  const [pictureTaken, setPictureTaken] = useState(false)
  const [pictureConfirmed, setPictureConfirmed] = useState(false)

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

  useHeader({
    title: 'Lastname, Firstname',
    close,
    subtitle: pictureConfirmed
      ? 'Reason for no QR code + Optional comments'
      : 'Take a photo to confirm attendance',
  })

  return (
    <ASafeAreaView>
      <View style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}>
        {hasPermission && !pictureConfirmed && (
          <Camera
            ref={ref}
            width={width}
            height={width}
            ratio="1:1"
            pictureSize={pictureSize}
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
            <TouchableOpacity
              activeOpacity={0.4}
              onPress={async () => {
                if (isDevice) {
                  let photo = await ref.current.takePictureAsync({
                    quality: 0.5,
                    exif: true,
                  })
                } else {
                  console.log('Click')
                }

                setPictureTaken(true)
              }}
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
              Is this photo sharp and identifying the person?
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
              <AButton
                onPress={() => {
                  setPictureConfirmed(true)
                }}
              >
                Yes
              </AButton>
            </View>
          </View>
        )}
        {pictureTaken && pictureConfirmed && (
          <View
            style={{
              paddingTop: 16,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 20,
            }}
          >
            <ATextInput autoFocus multiline numberOfLines={1} />
            <View style={{ paddingTop: 16 }}>
              <AButton mode="contained" onPress={() => navigation.goBack()}>
                Save
              </AButton>
            </View>
          </View>
        )}
      </View>
    </ASafeAreaView>
  )
}

export default MeetingAttendanceManualScreen
