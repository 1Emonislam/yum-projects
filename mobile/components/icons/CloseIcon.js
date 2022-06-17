import React from 'react'
import Svg, { Path } from 'react-native-svg'

const CloseIcon = ({ size = 24, color = 'black' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m14.7031 15.4062.7031-.7031-3.0234-3.0234 3.0234-3.00001-.6796-.67969-3 3-3.02348-3-.70312.70312 3.0234 2.99998-2.99996 3 .65625.6797 3.00001-3z"
        fill={color}
      />
    </Svg>
  )
}

export default CloseIcon
