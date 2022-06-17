import React from 'react'

import { Link, useHistory } from 'react-router-dom'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import TAdmin from '../templates/TAdmin'

const PAdminEmployees = () => {
  const history = useHistory()

  return (
    <TAdmin active="employees">
      <Box width="100%">
        <Box p={2} flexShrink={0}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/admin/employees/new"
          >
            New employee
          </Button>
        </Box>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Invited</TableCell>
              <TableCell align="right">Joined</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(Array(30).keys()).map(index => (
              <TableRow
                key={index}
                hover
                onClick={() => history.push(`/admin/employees/employee`)}
              >
                <TableCell>&nbsp;</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </TAdmin>
  )
}

export default PAdminEmployees
