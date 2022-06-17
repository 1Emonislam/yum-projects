import { useHistory } from 'react-router-dom'
import { timeFormat, timezone, useAuth, useSecureFormsByClientId } from 'shared'
import { useParams } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import capitalize from 'lodash/capitalize'
import CircularProgress from '@material-ui/core/CircularProgress'
import moment from 'moment-timezone'
import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TClient from '../templates/TClient'
import Typography from '@material-ui/core/Typography'

const PClientForms = () => {
  const { clientId } = useParams()

  const history = useHistory()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching, data } = useSecureFormsByClientId({
    id: clientId,
    role,
    userId,
    branchId,
  })

  return (
    <TClient active="forms" clientId={clientId}>
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
          <Typography variant="h2">No forms</Typography>
        </Box>
      )}
      {!isFetching && data && data.length > 0 && (
        <Box width="100%">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                {/* TODO:? */}
                {/* <TableCell>Place</TableCell> */}
                <TableCell>Employee</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Last update</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(form => (
                <TableRow
                  key={form._id}
                  hover
                  onClick={() =>
                    history.push(`/clients/${clientId}/forms/${form._id}`)
                  }
                >
                  <TableCell>{form.code}</TableCell>
                  <TableCell>{capitalize(form.status)}</TableCell>
                  <TableCell>
                    {form.type === 'application'
                      ? 'Loan application'
                      : 'Client inspection'}
                  </TableCell>
                  <TableCell>
                    {form.user.lastName}, {form.user.firstName}
                  </TableCell>
                  <TableCell>
                    {moment(form.createdAt)
                      .tz(timezone)
                      .format(timeFormat.default)}
                  </TableCell>
                  <TableCell>
                    {moment(form.updatedAt)
                      .tz(timezone)
                      .format(timeFormat.default)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </TClient>
  )
}

export default PClientForms
