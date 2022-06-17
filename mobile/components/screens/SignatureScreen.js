import { Colors } from '@constants'
import { Divider, Text, Portal } from 'react-native-paper'
import { SvgXml } from 'react-native-svg'
import { View } from 'react-native'
import AButton from '@atoms/AButton'
import ASafeAreaView from '@atoms/ASafeAreaView'
import ASnackbar from '@atoms/ASnackbar'
import OSignature from '@organisms/OSignature'
import React, { useRef, useEffect, useState } from 'react'
import { useHeader } from '@hooks'

export function SignatureScreen({ route, navigation }) {
  const ref = useRef()

  const [label, setLabel] = useState()
  const [context, setContext] = useState()
  const [name, setName] = useState()
  const [newSignature, setNewSignature] = useState()
  const [previousSignature, setPreviousSignature] = useState()
  const [readOnly, setReadOnly] = useState(false)

  const [screen, setScreen] = useState(0)
  const [height, setHeight] = useState(0)
  const [snackbar, setSnackbar] = useState(false)

  useEffect(() => {
    if (route.params) {
      const {
        label,
        context,
        name,
        screen,
        signature: previousSignature,
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

      if (previousSignature) {
        setPreviousSignature(previousSignature)
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
    setPreviousSignature,
  ])

  const onSubmit = () => {
    if (newSignature) {
      navigation.navigate(screen, {
        signature: {
          name,
          value: newSignature,
        },
      })
    } else {
      setSnackbar(true)
    }
  }

  const onRetake = () => {
    setPreviousSignature(null)
  }

  useHeader({
    subtitle: context || label,
  })

  return (
    <ASafeAreaView>
      <View
        style={{
          paddingTop: 8,
          paddingLeft: 20,
          paddingRight: 8,
          paddingBottom: 8,
          backgroundColor: Colors.white,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}
      >
        <Text>{previousSignature ? 'Preview' : 'Sign here'}:</Text>
        {!previousSignature && (
          <AButton onPress={() => ref.current.reset()}>Clear</AButton>
        )}
      </View>
      <Divider />
      <View
        style={{
          flexGrow: 1,
        }}
        onLayout={e => {
          if (e.nativeEvent.layout.width) {
            setHeight(e.nativeEvent.layout.height)
          }
        }}
      >
        {previousSignature && (
          <SvgXml xml={previousSignature} width="100%" height={height} />
        )}
        {!previousSignature && (
          <OSignature
            ref={ref}
            onFingerUp={svg => {
              setNewSignature(svg)
              setSnackbar(false)
            }}
            strokeColor="#369"
            strokeWidth={2}
            imageFormat="svg"
            outputType="xml"
            height={height}
          />
        )}
      </View>
      {!readOnly && (
        <View>
          <Divider />
          <View style={{ padding: 16, backgroundColor: Colors.white }}>
            {previousSignature && (
              <AButton mode="contained" onPress={onRetake}>
                Retake
              </AButton>
            )}
            {!previousSignature && (
              <AButton mode="contained" onPress={onSubmit}>
                Save signature
              </AButton>
            )}
          </View>
        </View>
      )}
      <Portal>
        <ASnackbar
          visible={snackbar}
          onDismiss={() => setSnackbar(false)}
          style={{ marginBottom: 84, marginHorizontal: 16 }}
        >
          Please make your signature
        </ASnackbar>
      </Portal>
    </ASafeAreaView>
  )
}

export default SignatureScreen
