import React from 'react'
import { TextInput } from 'react-native'
import { TextInput as ReactNativePaperTextInput } from 'react-native-paper'

const ATextInput = ({ render, ...props }) => (
  <ReactNativePaperTextInput
    dense
    mode="outlined"
    render={
      render
        ? render
        : ({ style, ...renderProps }) => (
            <TextInput
              style={{
                fontSize: 16,
                paddingTop: 4,
                paddingLeft: 14,
                paddingBottom: props.multiline ? 8 : 0,
                paddingRight: 4,
              }}
              {...renderProps}
            />
          )
    }
    disabled={props.disabled || props.readOnly}
    {...props}
  ></ReactNativePaperTextInput>
)

export default ATextInput
