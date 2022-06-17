import React, { useEffect } from 'react'

import TDefault from '../templates/TDefault'

import { logOut } from 'shared'
import { useHistory } from 'react-router-dom'

const PSignOut = () => {
  const history = useHistory()

  useEffect(() => {
    const run = async () => {
      await logOut()
      history.push('/')
    }
    run()
  }, [history])

  return <TDefault> </TDefault>
}

export default PSignOut
