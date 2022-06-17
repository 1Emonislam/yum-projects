import { Link, useParams } from 'react-router-dom'
import {
  timeFormat,
  timezone,
  useAuth,
  useSecureClientGroupsMeetingsByClientGroupId,
} from 'shared'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import moment from 'moment-timezone'
import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TGroup from '../templates/TGroup'
import Typography from '@material-ui/core/Typography'
import numeral from 'numeral'

const PClientForms = () => {
  const { clientGroupId } = useParams()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching, data } = useSecureClientGroupsMeetingsByClientGroupId({
    id: clientGroupId,
    role,
    userId,
    branchId,
  })

  return (
    <TGroup active="meetings" clientGroupId={clientGroupId}>
      {isFetching && (
        <Box
          flexGrow={1}
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="secondary" />
        </Box>
      )}
      {!isFetching && (!data || data.length === 0) && (
        <Box
          flexGrow={1}
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2">No meetings</Typography>
        </Box>
      )}
      {!isFetching && data && data.length > 0 && (
        <Box width="100%">
          <Table stickyHeader component="div" style={{ display: 'table' }}>
            <TableHead
              component="div"
              style={{ display: 'table-header-group' }}
            >
              <TableRow component="div" style={{ display: 'table-row' }}>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  width="25%"
                >
                  Time
                </TableCell>
                {/* TODO: */}
                {/* <TableCell>Leader</TableCell> */}
                {/* <TableCell>Place</TableCell> */}
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  width="20%"
                >
                  Clients
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell', textAlign: 'right' }}
                  width="20%"
                >
                  Total received
                </TableCell>
                {/* TODO: */}
                {/* <TableCell align="right">Installments</TableCell> */}
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  width="20%"
                  align="center"
                >
                  Requests
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  width="20%"
                  align="center"
                >
                  Notes
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody component="div" style={{ display: 'table-row-group' }}>
              {data
                .filter(meeting => meeting.scheduledAt)
                .map(meeting => (
                  <TableRow
                    key={meeting._id}
                    hover
                    component={Link}
                    to={`/groups/${clientGroupId}/meetings/${meeting._id}`}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {moment(meeting.scheduledAt)
                        .tz(timezone)
                        .format(timeFormat.withHours)}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {meeting?.attendance?.length || '0'}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell', textAlign: 'right' }}
                    >
                      Ush {numeral(meeting?.installments?.reduce((acc, installment) => acc + installment.todaysRealization, 0) || '0').format('0,0')}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      align="center"
                    >
                      {meeting?.requests ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      align="center"
                    >
                      {meeting?.notes ? 'Yes' : '—'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </TGroup>
  )
}

export default PClientForms
