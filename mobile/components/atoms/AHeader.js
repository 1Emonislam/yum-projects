import React, { useCallback } from 'react'
import debounce from 'lodash/debounce'
import { Appbar } from 'react-native-paper'
import { Colors } from '@constants'

function AHeader({ navigation, previous, scene }) {
  const { descriptor, route } = scene
  const title = descriptor?.options?.title || route?.name
  const subtitle = descriptor?.options?.subtitle ?? null
  const close = descriptor?.options?.close ?? false
  const actions = descriptor?.options?.actions ?? false

  const goBack = useCallback(
    debounce(() => {
      if (navigation.isFocused() && navigation.canGoBack()) {
        navigation.goBack()
      }
    }, 50),
    [navigation]
  )

  return (
    <Appbar.Header style={{ backgroundColor: Colors.white }}>
      {previous && !close ? (
        <Appbar.BackAction color={Colors.black} onPress={goBack} />
      ) : null}
      {close && (
        <Appbar.Action color={Colors.black} icon="close" onPress={goBack} />
      )}
      <Appbar.Content
        title={title}
        titleStyle={{
          fontFamily: 'AbhayaLibre_700Bold',
          fontSize: 24,
          paddingTop: 3,
        }}
        subtitle={subtitle}
        subtitleStyle={{
          color: Colors.placeholder,
          fontFamily: 'sans-serif-medium',
          paddingTop: 0,
          marginTop: 0,
          lineHeight: 16,
        }}
        color={Colors.black}
      />
      {actions}
    </Appbar.Header>
  )
}

export default AHeader
