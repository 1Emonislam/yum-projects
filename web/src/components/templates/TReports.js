import React from 'react'

import { Link } from 'react-router-dom'

import { useAuth } from 'shared'

import { makeStyles } from '@material-ui/core/styles'

import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import TDefault from '../templates/TDefault'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  toolbar: {
    paddingTop: '4px',
    marginBottom: '4px',
  },
  meta: {
    cursor: 'default',
  },
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
}))

const TReports = ({ active, children }) => {
  const classes = useStyles()

  const { isAdmin, isAreaOrRegionalManager } = useAuth()

  const adminTabs = (isAdmin || isAreaOrRegionalManager)
    ? [
        {
          url: '/admin/reports/loans',
          label: 'Loans',
        },
      ]
    : []

  const tabs = [
    {
      url: '/reports/cash-at-hand',
      label: 'Cash at hand',
    },
    {
      url: '/reports/collections-overview',
      label: 'Collections overview',
    },
    {
      url: '/reports/branch-overview',
      label: 'Branch overview',
    },
    ...adminTabs,
  ]

  return (
    <TDefault>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={classes.appbar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography variant="h1">Reports</Typography>
        </Toolbar>
        <Tabs
          value={tabs.findIndex(tab => tab.url === active)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs.map(tab => (
            <Tab
              key={tab.url}
              label={tab.label}
              component={Link}
              to={tab.url}
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

export default TReports
