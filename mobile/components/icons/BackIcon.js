import React from 'react'
import Svg, { Path } from 'react-native-svg'

const BackIcon = ({ size = 24, color = 'black' }) => {
  return (
    <Svg width={size} height={size} viewBox="2 2 18 18" fill="none">
      <Path
        d="m12.4062 14.7031-.7031.7031-3.02341-3.0234-.65625-.6797.70312-.7031 3.00004-3 .6796.67969-3.02339 3.00001z"
        fill={color}
      />
      <Path
        clip-rule="evenodd"
        d="m15 12.25h-6v-1h6z"
        fill-rule="evenodd"
        fill={color}
      />
    </Svg>
  )
}

export default BackIcon
