import React from 'react'
import TDefault from '../templates/TDefault'
import TMinimal from '../templates/TMinimal'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { useAuth } from 'shared'

const PNotFound = () => {
  const { isAuthenticated } = useAuth()

  const message = (
    <Box
      display="flex"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Typography variant="h1">Page not found</Typography>
    </Box>
  )

  return isAuthenticated ? (
    <TDefault>{message}</TDefault>
  ) : (
    <TMinimal>{message}</TMinimal>
  )
}

export default PNotFound
