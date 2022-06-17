import React from 'react'

import { useHistory } from 'react-router-dom'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import TAdmin from '../templates/TAdmin'

const PAdminLoans = () => {
  const history = useHistory()

  return (
    <TAdmin active="loans">
      <Box width="100%">
        <Box p={2} flexShrink={0}>
          <Button variant="contained" color="primary">
            New loan
          </Button>
        </Box>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(Array(2).keys()).map(index => (
              <TableRow
                key={index}
                hover
                onClick={() => history.push(`/admin/loans/loan`)}
              >
                <TableCell>&nbsp;</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </TAdmin>
  )
}

export default PAdminLoans
