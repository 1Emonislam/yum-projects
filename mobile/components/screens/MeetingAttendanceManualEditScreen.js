import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import { Caption, Paragraph } from 'react-native-paper'
import { Camera } from 'expo-camera'
import { isDevice } from 'expo-device'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import { Colors } from '@constants'

export function MeetingAttendanceManualEditScreen({ navigation }) {
  const ref = useRef()

  const [hasPermission, setHasPermission] = useState(null)
  const [flashMode, setFlashMode] = useState(false)
  const [pictureSize, setPictureSize] = useState()

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

  return (
    <ASafeAreaView>
      <ScrollView
        style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}
      >
        {hasPermission && (
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
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingTop: 4,
            paddingRight: 4,
          }}
        >
          <AButton onPress={() => {}}>Retake photo</AButton>
        </View>
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <Caption>Reason for no QR code and optional comments</Caption>
          <Paragraph>
            The client forgot a QR code in a hurry not to be late for the
            meeting
          </Paragraph>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingRight: 4,
            paddingBottom: 8,
          }}
        >
          <AButton onPress={() => {}}>Edit note</AButton>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingRight: 4,
            paddingBottom: 8,
            paddingTop: 4,
          }}
        >
          <AButton color={Colors.red} onPress={() => {}}>
            Cancel attendance
          </AButton>
        </View>
      </ScrollView>
    </ASafeAreaView>
  )
}

export default MeetingAttendanceManualEditScreen
