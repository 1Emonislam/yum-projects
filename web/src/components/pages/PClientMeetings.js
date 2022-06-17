import React from 'react'

import { useHistory } from 'react-router-dom'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import TClient from '../templates/TClient'

const PClientMeetings = () => {
  const history = useHistory()

  return (
    <TClient active="meetings">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Leader</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Attended</TableCell>
            <TableCell>Personally</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(Array(64).keys()).map(index => (
            <TableRow
              key={index}
              hover
              onClick={() => history.push(`/groups/group/meetings/meeting`)}
            >
              <TableCell>&nbsp;</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TClient>
  )
}

export default PClientMeetings
