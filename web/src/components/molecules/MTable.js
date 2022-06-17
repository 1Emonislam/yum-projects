import Box from '@material-ui/core/Box'
import React from 'react'
import Table from '@material-ui/core/Table'
import Typography from '@material-ui/core/Typography'

const MTable = ({ pt = 4, title, children, component, style }) => (
  <Box pt={pt}>
    {title && (
      <Box pb={1}>
        <Typography variant="h3">{title}</Typography>
      </Box>
    )}
    <Table component={component} style={style}>
      {children}
    </Table>
  </Box>
)

export default MTable
