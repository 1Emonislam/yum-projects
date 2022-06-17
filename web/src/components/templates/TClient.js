import {
  getClientRole,
  useAuth,
  useSecureClientById,
  useSecureLoansByClientId,
} from 'shared'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import capitalize from 'lodash/capitalize'
import CloseIcon from '@material-ui/icons/Close'
import ContactsIcon from '@material-ui/icons/Contacts'
import Dialog from '@material-ui/core/Dialog'
import FlagIcon from '@material-ui/icons/Flag'
import Grid from '@material-ui/core/Grid'
import GroupIcon from '@material-ui/icons/Group'
import IconButton from '@material-ui/core/IconButton'
import LabelIcon from '@material-ui/icons/Label'
import numeral from 'numeral'
import OReplaceClientGroupDialog from '../organisms/OReplaceClientGroupDialog'
import OWithdrawSecurityDialog from '../organisms/OWithdrawSecurityDialog'
import PNotFound from '../pages/PNotFound'
import React, { useMemo, useState } from 'react'
import SecurityIcon from '@material-ui/icons/Security'
import StoreIcon from '@material-ui/icons/Store'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import TDefault from '../templates/TDefault'
import Toolbar from '@material-ui/core/Toolbar'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.grey[300] + ' !important',
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
  link: {
    background: 'none',
    border: 0,
    color: 'inherit',
    cursor: 'pointer',
    display: 'inline',
    fontSize: '100%',
    margin: 0,
    padding: 0,
    textDecoration: 'underline',
  },
}))

const tabs = [
  {
    slug: 'loans',
    label: 'Loans',
  },
  {
    slug: 'installments',
    label: 'Installments',
  },
  // TODO:
  // {
  //   slug: 'meetings',
  //   label: 'Meetings',
  // },
  {
    slug: 'forms',
    label: 'Forms',
  },
  // { slug: "trail", label: "Audit trail" },
]

const TClient = ({ active, children, clientId }) => {
  const classes = useStyles()

  const [photoDialog, setPhotoDialog] = useState(false)
  const [withdrawSecurityDialog, setWithdrawSecurityDialog] = useState(false)
  const [replaceClientGroupDialog, setReplaceClientGroupDialog] =
    useState(false)

  const { _id: userId, branchId, role } = useAuth()

  const { isLoading, data: client } = useSecureClientById({
    id: clientId,
    role,
    userId,
    branchId,
  })

  const { data: loans } = useSecureLoansByClientId({
    id: clientId,
    role,
    userId,
    branchId,
  })

  const meta = useMemo(() => {
    const conditionalSecurityAdjustment =
      client &&
      loans &&
      ['branchManager', 'admin'].includes(role) &&
      client.securityBalance > 0 &&
      loans
        .filter(loan => {
          // FIXME: A temporary way of saying "I'm a product financing loan"

          if (loan.duration.value === 4 && loan.duration.unit === 'week') {
            return false
          }

          return true
        })
        .every(loan => loan.status === 'repaid')
        ? [
            {
              title: '',
              value: (
                <button
                  className={classes.link}
                  onClick={() => setWithdrawSecurityDialog(true)}
                >
                  Withdraw security
                </button>
              ),
            },
          ]
        : []

    return [
      {
        icon: <LabelIcon fontSize="small" />,
        title: 'Code',
        value: client?.code,
      },
      {
        icon: <FlagIcon fontSize="small" />,
        title: 'Status',
        value: capitalize(client?.status).replace('Tosurvey', 'To survey'),
      },
      {
        icon: <ContactsIcon fontSize="small" />,
        title: 'Role',
        value: getClientRole(client?._id, client?.clientGroup),
      },
      {
        icon: <GroupIcon fontSize="small" />,
        title: 'Group',
        value: client?.clientGroup.name,
        component: 'button',
        onClick: () => setReplaceClientGroupDialog(true),
      },
      {
        icon: <StoreIcon fontSize="small" />,
        title: 'Branch',
        value: client?.clientGroup?.branch?.name,
      },
      {
        icon: <SecurityIcon fontSize="small" />,
        title: 'Security',
        value: `USh ${numeral(client?.securityBalance || 0).format('0,0')}`,
      },
      ...conditionalSecurityAdjustment,
      // TODO:
      // {
      //   icon: <LinkIcon fontSize="small" />,
      //   title: 'Joined',
      //   value: client
      //     ? moment(client.admissionAt).tz(timezone).format('D MMMM YYYY')
      //     : '',
      // },
    ]
  }, [client, loans, role])

  return !isLoading && !client ? (
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
          <IconButton
            onClick={() => setPhotoDialog(true)}
            disabled={client?.photo === ''}
            className={classes.avatar}
          >
            {client?.photo !== '' && <Avatar alt="" src={client?.photo} />}
          </IconButton>
          <Typography variant="h1">
            {client ? `${client?.lastName}, ${client?.firstName}` : 'Loading…'}
          </Typography>
          {/* <Box flexGrow={1} />
              <Box display="flex" p={1}>
                 <Button startIcon={<CheckCircleIcon />} className={classes.action}>
                Approve
              </Button>
              <Button startIcon={<CancelIcon />} className={classes.action}>
                Reject
              </Button>
              <Button
                startIcon={<PauseCircleFilledIcon />}
                className={classes.action}
              >
                Deactivate
              </Button> 
                <Button
                  startIcon={<EditIcon />}
                  className={classes.action}
                  component={Link}
                  to="/clients/client/edit"
                >
                  Edit
                </Button>
              </Box> */}
        </Toolbar>
        <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={1}
            pl={2}
          >
            <Typography variant="h6">
              {client
                ? `${client?.lastName}, ${client?.firstName}`
                : 'Loading…'}
            </Typography>
            <IconButton onClick={() => setPhotoDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <img src={client?.photo} alt="" />
        </Dialog>
        <OReplaceClientGroupDialog
          open={replaceClientGroupDialog}
          onClose={() => setReplaceClientGroupDialog(false)}
          client={client}
          role={role}
          branchId={client?.clientGroup?.branch?._id}
          userId={userId}
        />
        <Box pl={2} overflow="hidden">
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
                    {item.icon && item.icon}
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
              to={`/clients/${clientId}/${tab.slug}`}
            />
          ))}
        </Tabs>
      </AppBar>
      <Box display="flex" flexGrow={1} overflow="auto">
        {children}
      </Box>
      <OWithdrawSecurityDialog
        client={client}
        open={withdrawSecurityDialog}
        onClose={() => setWithdrawSecurityDialog(false)}
      />
    </TDefault>
  )
}

export default TClient
