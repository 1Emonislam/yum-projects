import { DefaultTheme } from 'react-native-paper'

import Colors from './colors'

export default {
  ...DefaultTheme,
  roundness: 0,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.green,
    accent: Colors.orange,
    background: Colors.white,
    surface: Colors.white,
    error: Colors.red,
    text: Colors.black,
    placeholder: Colors.placeholder,
  },
}
