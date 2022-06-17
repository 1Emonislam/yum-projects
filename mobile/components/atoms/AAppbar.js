import React from 'react'
import { Appbar } from 'react-native-paper'
import Constants from 'expo-constants'
import { Colors } from '@constants'

const AAppbar = ({
  back = true,
  children,
  close = false,
  navigation,
  subtitle,
  title,
}) => (
  <Appbar.Header
    style={{
      backgroundColor: Colors.white,
      marginTop: Constants.statusBarHeight,
    }}
  >
    {back && !close && (
      <Appbar.Action
        color={Colors.black}
        icon="arrow-back"
        onPress={() => navigation.goBack()}
      />
    )}
    {close && (
      <Appbar.Action
        color={Colors.black}
        icon="close"
        onPress={() => navigation.goBack()}
      />
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
    {children}
  </Appbar.Header>
)

export default AAppbar
