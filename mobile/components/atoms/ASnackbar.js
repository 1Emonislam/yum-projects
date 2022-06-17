import { Colors, theme } from '@constants'
import { Snackbar } from 'react-native-paper'
import React from 'react'

const ASnackbar = ({ children, style, ...props }) => (
  <Snackbar
    style={{ backgroundColor: Colors.black, ...style }}
    theme={{
      ...theme,
      colors: { ...theme.Colors, accent: Colors.greenAlt },
    }}
    {...props}
  >
    {children}
  </Snackbar>
)

export default ASnackbar
