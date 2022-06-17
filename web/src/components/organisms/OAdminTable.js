import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Backdrop from '@material-ui/core/Backdrop'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import React from 'react'
import Table from '@material-ui/core/Table'
import Typography from '@material-ui/core/Typography'
import SettingsIcon from '@material-ui/icons/Settings'

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  wrapper: {
    display: 'flex',
    height: '100vh',
  },
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  toolbar: {
    paddingTop: '4px',
    marginBottom: '4px',
  },
  emptyState: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

const OAdminTable = ({
  newItem,
  slug,
  isFetching,
  isLoading,
  data,
  children,
}) => {
  const classes = useStyles()

  return (
    <Box width="100%" flexGrow={1} display="flex" flexDirection="column">
      <Box p={2} pb={1} flexShrink={0}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to={`/admin/${slug}/new`}
        >
          New {newItem}
        </Button>
      </Box>
      <Box flexGrow={1} overflow="auto" position="relative">
        <Backdrop transitionDuration={0} open={isFetching}>
          <CircularProgress color="secondary" />
        </Backdrop>
        {!isFetching && !isLoading && (!data || data.length === 0) && (
          <Box className={classes.emptyState}>
            <Box textAlign="center" paddingBottom={4}>
              <SettingsIcon />
              <Box paddingBottom={1}>
                <Typography variant="h2">Empty in {slug}</Typography>
              </Box>
              <Typography variant="body1">
                Use the “New {newItem}” button in the upper left corner
              </Typography>
            </Box>
          </Box>
        )}
        {!isFetching && !isLoading && data && data.length > 0 && (
          <Table
            stickyHeader
            size="small"
            component="div"
            style={{ display: 'table' }}
          >
            {children}
          </Table>
        )}
      </Box>
    </Box>
  )
}

export default OAdminTable
