import { capitalize } from 'lodash'
import {
  getClientRole,
  useAuth,
  useClientGroupWithStats,
  useSecureClientsByClientGroupId,
} from 'shared'
import { Link, useParams } from 'react-router-dom'
import Box from '@material-ui/core/Box'
import numeral from 'numeral'
import React, { useMemo } from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TGroup from '../templates/TGroup'
import Typography from '@material-ui/core/Typography'

const Item = ({ label, children }) => (
  <Box pb={1}>
    <Typography variant="body2">
      <strong>{label}</strong>
    </Typography>
    <Typography variant="body2">{children}</Typography>
  </Box>
)

const PGroupClients = () => {
  const { clientGroupId } = useParams()

  const { _id: userId, branchId, role } = useAuth()

  const { isFetching: isFetchingClients, data: clients } =
    useSecureClientsByClientGroupId({
      id: clientGroupId,
      role,
      userId,
      branchId,
    })

  const { data: clientGroup } = useClientGroupWithStats(clientGroupId, {
    enabled: clients?.length > 0 ? true : false,
  })

  const activeClients = useMemo(() => {
    if (clients) {
      return clients.filter(
        client =>
          client.status.toLowerCase() === 'active' ||
          client.status.toLowerCase() === 'tosurvey'
      ).length
    }

    return 0
  }, [clients])

  const registeredClients = useMemo(() => clients?.length || 0, [clients])

  return (
    <TGroup active="clients" clientGroupId={clientGroupId}>
      <Box display="flex" width="100%" pt={1}>
        <Box width={220} p={2} pt={1}>
          <Item label="Registered clients">{registeredClients}</Item>
          <Item label="Active clients">{activeClients}</Item>
          <Item label="Loans outstanding">
            {clientGroup?.loansOutstanding
              ? `USh ${numeral(clientGroup.loansOutstanding).format('0,0')}`
              : 'USh 0'}
          </Item>
          <Item label="Security balance">
            {clientGroup?.securityBalance
              ? `USh ${numeral(clientGroup.securityBalance).format('0,0')}`
              : 'USh 0'}
          </Item>
          {/* TODO: */}
          {/* <Item label="Started">3 January 2019</Item> */}
        </Box>
        <Box flexGrow={1} overflow="auto">
          <Table
            stickyHeader
            size="small"
            component="div"
            style={{ display: 'table' }}
          >
            <TableHead
              component="div"
              style={{ display: 'table-header-group' }}
            >
              <TableRow component="div" style={{ display: 'table-row' }}>
                <TableCell
                  component="div"
                  style={{ display: 'table-cell' }}
                  width="10"
                >
                  Code
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Name
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Role
                </TableCell>
                <TableCell component="div" style={{ display: 'table-cell' }}>
                  Client status
                </TableCell>
                {/* TODO: */}
                {/* <TableCell>Loan status</TableCell> */}
                {/* <TableCell>Joined</TableCell> */}
              </TableRow>
            </TableHead>
            {!isFetchingClients && clients && (
              <TableBody component="div" style={{ display: 'table-row-group' }}>
                {clients.map(client => {
                  const clientRole = getClientRole(client._id, clientGroup)

                  return (
                    <TableRow
                      key={client?._id}
                      hover
                      component={Link}
                      to={`/clients/${client?._id}`}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {client?.code}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {client?.lastName}, {client?.firstName}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {clientRole !== 'Member' ? clientRole : '—'}
                      </TableCell>
                      <TableCell
                        component="div"
                        style={{ display: 'table-cell' }}
                      >
                        {capitalize(client?.status).replace(
                          'Tosurvey',
                          'To survey'
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            )}
          </Table>
        </Box>
      </Box>
    </TGroup>
  )
}

export default PGroupClients
