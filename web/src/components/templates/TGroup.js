import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { useAuth, useSecureClientGroup, useInsertEvent } from 'shared'
import { useQueryClient } from 'react-query'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CancelIcon from '@material-ui/icons/Cancel'
import capitalize from 'lodash/capitalize'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import EventIcon from '@material-ui/icons/Event'
import FlagIcon from '@material-ui/icons/Flag'
import Grid from '@material-ui/core/Grid'
import LabelIcon from '@material-ui/icons/Label'
import moment from 'moment-timezone'
import OReplaceLoanOfficerDialog from '../organisms/OReplaceLoanOfficerDialog'
import PNotFound from '../pages/PNotFound'
import React, { Fragment, useMemo, useState } from 'react'
import StoreIcon from '@material-ui/icons/Store'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TDefault from '../templates/TDefault'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import WatchLaterIcon from '@material-ui/icons/WatchLater'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  toolbar: {
    height: '56px',
  },
  meta: {
    cursor: 'default',
    border: 0,
    background: 'none',
    padding: 0,
  },
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
}))

const tabs = [
  {
    slug: 'clients',
    label: 'Clients',
  },
  // TODO:
  // {
  //   slug: 'loans',
  //   label: 'Loans',
  // },
  {
    slug: 'meetings',
    label: 'Meetings',
  },
  // TODO:
  // { slug: "trail", label: "Audit trail" },
]

const TGroup = ({ active, children, clientGroupId }) => {
  const classes = useStyles()

  const { _id: userId, branchId, role } = useAuth()

  const { isLoading, data: clientGroup } = useSecureClientGroup({
    id: clientGroupId,
    role,
    userId,
    branchId,
  })

  const queryClient = useQueryClient()

  const { mutate } = useInsertEvent({
    onMutate: async () => {
      await queryClient.cancelQueries([
        'clientGroup',
        clientGroupId,
        role,
        userId,
        branchId,
      ])

      const previousClientGroup = queryClient.getQueryData([
        'clientGroup',
        clientGroupId,
        role,
        userId,
        branchId,
      ])

      queryClient.setQueryData(
        ['clientGroup', clientGroupId, role, userId, branchId],
        old => {
          return {
            ...old,
            status: action === 'Reject' ? 'rejected' : 'active',
          }
        }
      )

      return { previousClientGroup }
    },
    onSuccess: () => {
      queryClient.invalidateQueries('clientGroupsByStatus')
    },
  })

  const [dialog, setDialog] = useState(false)
  const [action, setAction] = useState('Reject')
  const [replaceLoanOfficerDialog, setReplaceLoanOfficerDialog] =
    useState(false)

  const decide = () => {
    const conditionalPayload = action === 'Reject' ? { wasRejected: true } : {}

    mutate({
      type: 'update',
      obj: 'clientGroup',
      _id: clientGroup?._id,
      status: action === 'Reject' ? 'rejected' : 'active',
      ...conditionalPayload,
    })

    setDialog(false)
  }

  const meta = useMemo(() => {
    return [
      {
        icon: <LabelIcon fontSize="small" />,
        title: 'Code',
        value: clientGroup?.code,
      },
      {
        icon: <FlagIcon fontSize="small" />,
        title: 'Status',
        value: capitalize(clientGroup?.status),
      },
      {
        icon: <StoreIcon fontSize="small" />,
        title: 'Branch',
        value: clientGroup?.branch?.name,
      },
      {
        icon: <AccountCircleIcon fontSize="small" />,
        title: 'Loan Officer',
        value: clientGroup
          ? `${clientGroup.loanOfficer.lastName}, ${clientGroup.loanOfficer.firstName}`
          : '',
        ...(['branchManager', 'admin'].includes(role)
          ? {
              component: 'button',
              onClick: () => setReplaceLoanOfficerDialog(true),
            }
          : {}),
      },
      {
        icon: <EventIcon fontSize="small" />,
        title: 'Meeting day',
        value: clientGroup
          ? moment().isoWeekday(clientGroup.meeting.dayOfWeek).format('dddd')
          : '',
      },
      {
        icon: <WatchLaterIcon fontSize="small" />,
        title: 'Meeting time',
        value: clientGroup?.meeting?.time,
      },
    ]
  }, [clientGroup, role])

  return !isLoading && !clientGroup ? (
    <PNotFound />
  ) : (
    <TDefault>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={classes.appbar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography variant="h1">
            {clientGroup?.name || 'Loading…'}
          </Typography>
          <Box flexGrow={1} />
          {clientGroup?.status === 'pending' &&
            (role === 'branchManager' || role === 'admin') && (
              <Box display="flex" p={1}>
                <Button
                  startIcon={<CheckCircleIcon />}
                  className={classes.action}
                  onClick={() => {
                    setDialog(true)
                    setAction('Approve')
                  }}
                >
                  Approve
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  className={classes.action}
                  onClick={() => {
                    setDialog(true)
                    setAction('Reject')
                  }}
                >
                  Reject
                </Button>
                {/* TODO: */}
                {/* <Button
              startIcon={<PauseCircleFilledIcon />}
              className={classes.action}
            >
              Deactivate
            </Button>
            <Button
              startIcon={<EditIcon />}
              className={classes.action}
              component={Link}
              to="/groups/group/edit"
            >
              Edit
            </Button> */}
              </Box>
            )}
        </Toolbar>
        <Dialog open={dialog} onClose={() => setDialog(false)}>
          <DialogTitle id="form-dialog-title">{action} the group</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure that you want to {String(action).toLowerCase()} the{' '}
              {clientGroup?.name} group?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={decide} color="primary">
              {action}
            </Button>
          </DialogActions>
        </Dialog>
        <OReplaceLoanOfficerDialog
          open={replaceLoanOfficerDialog}
          onClose={() => setReplaceLoanOfficerDialog(false)}
          clientGroup={clientGroup}
        />
        <Box pl={2} overflow="hidden" style={{ userSelect: 'none' }}>
          <Grid container spacing={2}>
            {meta.map((item, index) => (
              <Grid item key={index}>
                <Tooltip title={item.title} arrow>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="text.secondary"
                    className={classes.meta}
                    component={item.component || 'div'}
                    onClick={
                      item.component === 'button' ? item.onClick : undefined
                    }
                    style={
                      item.component === 'button'
                        ? {
                            cursor: 'pointer',
                          }
                        : {}
                    }
                  >
                    {item.icon}
                    <Typography variant="body2" color="textSecondary">
                      &nbsp;{item.value}
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Tabs
          value={tabs.findIndex(tab => tab.slug === active)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.slug}
              label={tab.label}
              component={Link}
              to={`/groups/${clientGroupId}/${tab.slug}`}
            />
          ))}
        </Tabs>
      </AppBar>
      <Box display="flex" flexGrow={1} overflow="auto">
        {children}
      </Box>
    </TDefault>
  )
}

export default TGroup
