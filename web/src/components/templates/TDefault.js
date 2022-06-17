import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import AddIcon from '@material-ui/icons/Add'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import AssignmentIcon from '@material-ui/icons/Assignment'
import GroupIcon from '@material-ui/icons/Group'
import PersonIcon from '@material-ui/icons/Person'
import SettingsIcon from '@material-ui/icons/Settings'
import TableChartIcon from '@material-ui/icons/TableChart'
import React, { Fragment, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth, useNotifications, useUserProfile } from 'shared'
import AddModel from '../modals/addModal'
import { version } from './../../../package.json'
const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  wrapper: {
    display: 'flex',
    height: '100vh',
    background: '#fff',
  },
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  navigationRail: {
    flexShrink: 0,
    width: theme.spacing(9),
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1111,
    background:
      'linear-gradient(45deg, rgba(75,170,107,1) 0%, rgba(0,200,200,1) 100%)',
  },
  navigationRailItem: {
    color: 'rgba(255, 255, 255, 0.5)',
    height: theme.spacing(9),
    '&:hover': {
      background: 'none',
      color: '#fff',
    },
    '& .MuiButton-label': {
      flexDirection: 'column',
    },
  },
  navigationRailItemActive: {
    color: theme.palette.common.white,
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  logo: {
    padding: '15px 0',
    color: '#fff',
    '&:hover': {
      background: 'none',
    },
  },
  logoImg: {
    height: '18px',
  },
  avatar: {
    backgroundColor: '#fff',
    color: theme.palette.secondary.main,
    margin: '0 auto',
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: 11,
    fontWeight: 500,
  },
  version: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
  },
  add: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    paddingBottom: theme.spacing(2),
    cursor: 'pointer'
  },
}))

let menu = [
  {
    slug: 'forms',
    icon: <AssignmentIcon />,
    label: 'Forms',
  },
  {
    slug: 'loans',
    icon: <AccountBalanceIcon />,
    label: 'Loans',
  },
  {
    slug: 'groups',
    icon: <GroupIcon />,
    label: 'Groups',
  },
  {
    slug: 'clients',
    icon: <PersonIcon />,
    label: 'Clients',
  },
  {
    slug: 'reports',
    icon: <TableChartIcon />,
    label: 'Reports',
    forBranchManagersAndAdmins: true,
  },
]

const NavigationRailItem = ({ icon, slug, label, badge = false, exact }) => {
  const classes = useStyles()

  return (
    <Button
      className={classes.navigationRailItem}
      activeClassName={classes.navigationRailItemActive}
      color="inherit"
      component={NavLink}
      exact={exact}
      {...(slug ? { to: '/' + slug } : { to: '/' })}
    >
      <Badge color="primary" variant="dot" invisible={!badge}>
        {icon}
      </Badge>
      <span>{label}</span>
    </Button>
  )
}

const TDefault = ({ children }) => {
  const classes = useStyles()
  const content = {
    title: 'Add Forms'
  }
  const [addOpen, setAddOpen] = useState(false);
  const addHandleOpen = () => setAddOpen(true);
  const addHandleClose = () => setAddOpen(false);
  const { isAuthenticated, isBranchManager, isAdmin, isAreaOrRegionalManager } = useAuth()

  const user = useUserProfile()

  const { data: notifications } = useNotifications({ enabled: isAuthenticated })

  const location = useLocation()

  const [snackbar, setSnackbar] = useState()

  useEffect(() => {
    if (location.state?.snackbar) {
      setSnackbar(location.state?.snackbar)
    }
  }, [location])

  return (
    <div className={classes.wrapper}>
      <div className={classes.navigationRail}>
        <Button
          className={classes.logo}
          color="inherit"
          component={Link}
          to="/forms"
        >
          <img src="/yam.png" alt="Yam" className={classes.logoImg} />
        </Button>
        <Box pb={1} style={{ textDecoration: 'none' }}>
          <Tooltip
            title={`Signed in as ${user?.firstName} ${user?.lastName}`}
            placement="right"
            arrow
          >
            <Avatar className={classes.avatar}>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
          </Tooltip>
        </Box>
        {menu.map(({ slug, icon, label, forBranchManagersAndAdmins }) => (
          <Fragment key={slug}>
            {(!forBranchManagersAndAdmins || isAreaOrRegionalManager ||
              (forBranchManagersAndAdmins && (isBranchManager || isAdmin))) && (
                <NavigationRailItem
                  slug={slug}
                  icon={icon}
                  label={label}
                  badge={notifications?.[slug.replace('groups', 'clientGroups')]}
                />
              )}
          </Fragment>
        ))}
        <div className={classes.grow} />
        <div className={classes.version} title="Version">
          {version}
        </div>
        <div className={classes.add} onClick={addHandleOpen}>
          <div>
            <AddIcon />
          </div>
          <span>Add</span>

        </div>
        <AddModel content={content} addOpen={addOpen} setAddOpen={setAddOpen} addHandleClose={addHandleClose} addHandleOpen={addHandleOpen} />
        {user.role === 'admin' && (
          <NavigationRailItem
            icon={<SettingsIcon />}
            slug="admin"
            label="Settings"
          />
        )}
        {user.role !== 'admin' && (
          <NavigationRailItem
            icon={<SettingsIcon />}
            slug="password"
            label="Settings"
          />
        )}
        <NavigationRailItem
          icon={<ArrowBackIcon />}
          slug="signout"
          label="Sign&nbsp;out"
          exact
        />
      </div>
      <div className={classes.content}>{children}</div>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        autoHideDuration={5000}
        open={snackbar !== undefined}
        onClose={() => setSnackbar(undefined)}
        message={snackbar}
      />
    </div>
  )
}

export default TDefault
