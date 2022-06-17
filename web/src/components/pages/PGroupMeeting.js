import { Link, useHistory, useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import {
  timeFormat,
  timezone,
  useAuth,
  useSecureClientGroupsMeetingById,
} from 'shared'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import CloseIcon from '@material-ui/icons/Close'
import DoneIcon from '@material-ui/icons/Done'
import MLoanPhoto from '../molecules/MLoanPhoto'
import moment from 'moment-timezone'
import MTable from '../molecules/MTable'
import numeral from 'numeral'
import React, { Fragment, useMemo } from 'react'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TGroup from '../templates/TGroup'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
  bar: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
    height: 52,
    flexShrink: 0,
  },
  button: {
    background: 'none',
    border: 0,
    padding: 0,
    margin: 0,
    fontSize: 'inherit',
    letterSpacing: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  warning: {
    paddingLeft: 15,
    borderLeft: '2px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
}))

const PGroupMeeting = () => {
  const classes = useStyles()

  const { clientGroupId, meetingId } = useParams()

  const history = useHistory()

  const { _id: userId, branchId, role, isLoanOfficer } = useAuth()

  const { isFetching, data: meeting } = useSecureClientGroupsMeetingById({
    id: meetingId,
    role,
    userId,
    branchId,
  })

  const activeClients = useMemo(() => {
    if (meeting) {
      return meeting?.attendance?.length ?? null
    }

    return null
  }, [meeting])

  const presentClients = useMemo(() => {
    if (meeting) {
      return meeting?.attendance?.filter(client => client.attended).length ?? 0
    }

    return 0
  }, [meeting])

  const attendanceWarning = useMemo(() => {
    return activeClients - presentClients !== 0
  }, [activeClients, presentClients])

  const getClientById = clientId => {
    const client =
      meeting?.attendance?.find(a => a.clientId === clientId) ?? null

    if (client === null) {
      return `Unknown client: ${clientId}`
    }

    const { firstName, lastName } = client

    return `${lastName}, ${firstName}`
  }

  return (
    <TGroup active="meetings" clientGroupId={clientGroupId}>
      <Box display="flex" flexDirection="column" width="100%">
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
        >
          <Typography variant="h2">
            {meeting?.scheduledAt
              ? moment(meeting?.scheduledAt)
                  .tz(timezone)
                  .format(timeFormat.longDate)
              : 'Loading…'}
          </Typography>
        </Box>
        <Box
          flexGrow={1}
          overflow="auto"
          bgcolor="grey.200"
          position="relative"
          px={2}
          pb={8}
        >
          {isFetching && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <CircularProgress color="secondary" />
            </Box>
          )}
          {!isFetching && (
            <Fragment>
              <MTable pt={2}>
                <TableBody>
                  <TableRow hover>
                    <TableCell width="250">Scheduled:</TableCell>
                    <TableCell>
                      {meeting?.scheduledAt
                        ? moment(meeting?.scheduledAt)
                            .tz(timezone)
                            .format(timeFormat.full)
                        : 'Loading…'}
                    </TableCell>
                  </TableRow>
                  {!isLoanOfficer && (
                    <TableRow hover>
                      <TableCell width="250">Start:</TableCell>
                      <TableCell>
                        {meeting?.startedAt
                          ? moment(meeting?.startedAt)
                              .tz(timezone)
                              .format(timeFormat.full)
                          : 'Loading…'}
                      </TableCell>
                    </TableRow>
                  )}
                  {/* TODO: */}
                  {/* <TableRow>
                    <TableCell>Leader:</TableCell>
                    <TableCell>Lastname, Firstname</TableCell>
                  </TableRow> */}
                  <MLoanPhoto
                    label="Photo"
                    context="Photo from the meeting"
                    photo={{ uri: meeting?.photoUrl ?? null }}
                  />
                  {/* TODO: */}
                  {/* <TableRow>
                    <TableCell>Place:</TableCell>
                    <TableCell>Mpuuga Plaza, 8 Broadway Rd, Masaka</TableCell>
                  </TableRow> */}
                  <TableRow hover>
                    <TableCell
                      className={attendanceWarning ? classes.warning : ''}
                    >
                      Clients:
                    </TableCell>
                    <TableCell>
                      {presentClients} out of {activeClients} clients
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className={
                        meeting?.requests && meeting?.requests !== ''
                          ? classes.warning
                          : ''
                      }
                    >
                      Requests:
                    </TableCell>
                    <TableCell>
                      {meeting?.requests && meeting?.requests !== ''
                        ? meeting.requests
                        : '–'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className={
                        meeting?.notes && meeting?.notes !== ''
                          ? classes.warning
                          : ''
                      }
                    >
                      Notes:
                    </TableCell>
                    <TableCell>
                      {meeting?.notes && meeting?.notes !== ''
                        ? meeting.notes
                        : '–'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </MTable>
              {(meeting?.attendance?.length ?? 0) > 0 && (
                <MTable title="Attendance">
                  <TableBody>
                    {meeting.attendance
                      .sort((a, b) => {
                        if (a.lastName < b.lastName) {
                          return -1
                        }

                        if (a.lastName > b.lastName) {
                          return 1
                        }

                        return 0
                      })
                      .map(client => (
                        <TableRow
                          key={client.clientId}
                          hover
                          onClick={() =>
                            history.push(`/clients/${client.clientId}`)
                          }
                        >
                          <TableCell
                            width="250"
                            padding="none"
                            className={client.attended ? '' : classes.warning}
                          >
                            <Box pl={2} display="flex">
                              {client.attended ? (
                                <DoneIcon fontSize="small" />
                              ) : (
                                <CloseIcon fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {client.lastName}, {client.firstName}
                          </TableCell>
                          <TableCell align="right">
                            {client.representative ? 'Representative' : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </MTable>
              )}
              {meeting?.installments.length > 0 && (
                <MTable title="Installments">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Installment</TableCell>
                      {/* TODO: */}
                      {/* <TableCell>Overdue</TableCell> */}
                      {/* <TableCell title="Missed installments">Missed</TableCell> */}
                      <TableCell>Overdue</TableCell>
                      <TableCell>Opening balance</TableCell>
                      <TableCell>Realization</TableCell>
                      {/* TODO: */}
                      {/* <TableCell>Cumulative realization</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {meeting.installments.map((installment, index) => (
                      <TableRow key={index} hover>
                        <TableCell
                          width="40"
                          padding="none"
                          className={
                            installment.status === 'paid' ? '' : classes.warning
                          }
                        >
                          <Box pl={2} display="flex">
                            {installment.status === 'paid' ? (
                              <DoneIcon fontSize="small" />
                            ) : (
                              <CloseIcon fontSize="small" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell width="210">
                          <Link to={`/clients/${installment.clientId}`}>
                            {getClientById(installment.clientId)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          USh {numeral(installment.installment).format('0,0')}
                        </TableCell>
                        <TableCell>
                          USh {numeral(installment.overdue).format('0,0')}
                        </TableCell>
                        <TableCell>
                          USh{' '}
                          {numeral(installment.openingBalance).format('0,0')}
                        </TableCell>
                        <TableCell>
                          USh{' '}
                          {numeral(installment.todaysRealization).format('0,0')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </MTable>
              )}
            </Fragment>
          )}
        </Box>
      </Box>
    </TGroup>
  )
}

export default PGroupMeeting
