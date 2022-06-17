import React from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import { useUserProfile } from 'shared'

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

const tabs = [
  {
    slug: 'holidays',
    label: 'Holidays',
  },
  {
    slug: 'password',
    label: 'Password',
    isSettings: true,
  },
]

const TSettings = ({ active, children }) => {
  const classes = useStyles()
  const user = useUserProfile()

  const tabsFiltered = tabs.filter(tab => {
    if (tab.slug === 'holidays' && user.role !== 'admin') return false

    return true
  })

  return (
    <TDefault>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={classes.appbar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography variant="h1">Settings</Typography>
        </Toolbar>
        <Tabs
          value={tabsFiltered.findIndex(tab => tab.slug === active)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabsFiltered.map(tab => (
            <Tab
              key={tab.slug}
              label={tab.label}
              component={Link}
              to={tab.isSettings ? '/password' : `/admin/${tab.slug}`}
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

export default TSettings
