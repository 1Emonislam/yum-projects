import React from 'react'
import Svg, { Path } from 'react-native-svg'

const SignOutIcon = ({ size = 24, color = 'black' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 11.5h12.1v.5h-12.1z" fill={color} />
      <Path
        d="m16 13.8284h4v1.5h-4z"
        transform="matrix(.70710678 -.70710678 .70710678 .70710678 -5.091864 15.363953)"
        fill={color}
      />
      <Path
        d="m16.7071 8.9h4v1h-4z"
        transform="matrix(.70710678 .70710678 -.70710678 .70710678 11.186647 -9.206954)"
        fill={color}
      />
      <Path
        d="m9.39844 3.66992c-1.92774.51953-3.38379 1.77051-4.36817 3.75293-.66992 1.38086-1.00488 2.89165-1.00488 4.53225 0 2.2969.6084 4.2246 1.8252 5.7832.92968 1.1758 2.09179 1.9551 3.48632 2.3379l.20508-.5537c-2.10547-.793-3.1582-3.3291-3.1582-7.6084.01367-4.32035 1.08008-6.88383 3.19922-7.69047z"
        fill={color}
      />
    </Svg>
  )
}

export default SignOutIcon
