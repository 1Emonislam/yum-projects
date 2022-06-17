import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, useWindowDimensions, View } from 'react-native'
import {
  Checkbox,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal,
  Snackbar,
} from 'react-native-paper'
import { Camera } from 'expo-camera'
import { isDevice } from 'expo-device'
import ASafeAreaView from '@atoms/ASafeAreaView'
import AButton from '@atoms/AButton'
import { Colors, theme } from '@constants'

export function MeetingAttendanceScreenV2({ navigation }) {
  const ref = useRef()

  const [hasPermission, setHasPermission] = useState(null)
  const [flashMode, setFlashMode] = useState(false)
  const [pictureSize, setPictureSize] = useState()

  const [dialog, setDialog] = useState(false)
  const showDialog = () => setDialog(true)
  const hideDialog = () => setDialog(false)

  const [snackbar, setSnackbar] = useState(true)

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
      <View style={{ backgroundColor: Colors.white, flexGrow: 1, flex: 1 }}>
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
        <ScrollView style={{ backgroundColor: Colors.white, flex: 1 }}>
          <List.Section>
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => (
                <Checkbox
                  status="checked"
                  color={Colors.green}
                  onPress={() => showDialog()}
                />
              )}
              right={() => (
                <View style={{ marginTop: -8, marginBottom: -8 }}>
                  <IconButton icon="people" size={24} onPress={() => {}} />
                </View>
              )}
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="checked" color={Colors.green} />}
              onPress={() => showDialog()}
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="checked" color={Colors.green} />}
              right={() => (
                <View style={{ marginTop: -8, marginBottom: -8 }}>
                  <IconButton icon="edit" size={24} />
                </View>
              )}
              onPress={() => {
                setSnackbar(false)
                navigation.navigate('Meeting: Take attendance: Manual: Edit')
              }}
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
            <List.Item
              title="Lastname, Firstname"
              left={() => <Checkbox status="unchecked" />}
              onPress={() =>
                navigation.navigate('Meeting: Take attendance: Manual')
              }
            />
          </List.Section>
        </ScrollView>
      </View>
      <Portal>
        <Dialog visible={dialog} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to cancel Firstname Lastname’s attendance?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <AButton onPress={hideDialog}>No</AButton>
            <AButton onPress={hideDialog}>Yes, I’m sure</AButton>
          </Dialog.Actions>
        </Dialog>
        <Snackbar
          visible={snackbar}
          onDismiss={() => {}}
          action={{
            label: 'Representative',
            onPress: () => {},
          }}
          style={{ backgroundColor: Colors.black }}
          theme={{
            ...theme,
            colors: { ...theme.Colors, accent: Colors.greenAlt },
          }}
        >
          Lastname confirmed
        </Snackbar>
      </Portal>
    </ASafeAreaView>
  )
}

export default MeetingAttendanceScreenV2
