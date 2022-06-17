import { Link } from 'react-router-dom'
import { useAuth, useSecureLoansByClientId } from 'shared'
import { useParams } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import capitalize from 'lodash/capitalize'
import CircularProgress from '@material-ui/core/CircularProgress'
import numeral from 'numeral'
import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TClient from '../templates/TClient'
import Typography from '@material-ui/core/Typography'

const PClientLoans = () => {
  const { clientId } = useParams()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching, data } = useSecureLoansByClientId({
    id: clientId,
    role,
    userId,
    branchId,
  })

  return (
    <TClient active="loans" clientId={clientId}>
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
          <Typography variant="h2">No loans</Typography>
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
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Code
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Status
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Cycle
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Type
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Duration
                </TableCell>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  align="right"
                >
                  Principal amount
                </TableCell>
                {/* TODO: */}
                {/* <TableCell align="right">Interest amount</TableCell> */}
                {/* <TableCell align="right">Outstanding</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody component="div" style={{ display: 'table-row-group' }}>
              {data.map(loan => {
                let duration

                const value = loan.duration.value

                switch (loan.duration.unit) {
                  case 'week':
                    duration = `${value} weeks`
                    break
                  case 'twoWeeks':
                    duration = `${value * 2} weeks`
                    break
                  case 'month':
                    duration = `${value} months`
                    break
                }

                return (
                  <TableRow
                    key={loan._id}
                    hover
                    component={Link}
                    to={`/clients/${clientId}/loans/${loan._id}`}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan.code}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {capitalize(loan.status)
                        .replace(
                          'Awaitingmanagerreview',
                          'Awaiting manager review'
                        )
                        .replace('Approvedbymanager', 'Approved')
                        .replace('Rejectedbymanager', 'Rejected')
                        .replace('Notpaid', 'Not paid')}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan.cycle}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {loan.loanProductName}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                    >
                      {duration}
                    </TableCell>
                    <TableCell
                      component="div"
                      style={{ display: 'table-cell' }}
                      align="right"
                    >
                      USh{' '}
                      {numeral(
                        loan.approvedAmount || loan.requestedAmount
                      ).format('0,0')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </TClient>
  )
}

export default PClientLoans
