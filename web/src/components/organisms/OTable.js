import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Backdrop from '@material-ui/core/Backdrop'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import React, { Fragment } from 'react'
import Tab from '@material-ui/core/Tab'
import Table from '@material-ui/core/Table'
import TableFooter from '@material-ui/core/TableFooter'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import Tabs from '@material-ui/core/Tabs'
import TDefault from '../templates/TDefault'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import theme from '../../theme'

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
  dropdowns: {
    position: 'fixed',
    top: 0,
    right: 8,
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
  footer: {
    border: 0,
  },
}))

const OTable = ({
  title,
  slug,
  icon,
  tabs,
  status,
  isFetching,
  isLoading,
  data,
  children,
  numberOfColumns,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  dropdowns,
  suffix = '',
}) => {
  const classes = useStyles()

  return (
    <TDefault>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={classes.appbar}
      >
        <Toolbar className={classes.toolbar}>
          <Typography variant="h1">{title}</Typography>
        </Toolbar>
        <Tabs
          value={tabs?.findIndex(tab => tab.slug === status)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabs?.map(tab => (
            <Tab
              key={tab.slug}
              label={tab.label}
              component={Link}
              to={`/${slug}/${tab.slug}${suffix}`}
            />
          ))}
        </Tabs>
        {dropdowns && <div className={classes.dropdowns}>{dropdowns}</div>}
      </AppBar>
      <Box flexGrow={1} overflow="auto" position="relative">
        <Backdrop transitionDuration={0} open={isLoading}>
          <CircularProgress color="secondary" />
        </Backdrop>
        {!isFetching &&
          !isLoading &&
          (!data || !data.pages || data.pages[0].length === 0) && (
            <Box className={classes.emptyState}>
              <Box textAlign="center" paddingBottom={4}>
                {icon}
                <Box paddingBottom={1}>
                  <Typography variant="h2">
                    Empty in {status !== 'all' ? status : ''} {slug}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {tabs?.find(tab => tab.slug === status).empty}
                </Typography>
              </Box>
            </Box>
          )}
        {!isLoading && data && data.pages && data.pages[0].length > 0 && (
          <Fragment>
            <Table
              stickyHeader
              size="small"
              component="div"
              style={{ display: 'table' }}
            >
              {children}
            </Table>
            {hasNextPage && (
              <Box
                display="flex"
                alignItems="center"
                height={theme.spacing(6)}
                pl={1}
              >
                {isFetchingNextPage && (
                  <Box pl={1} style={{ paddingTop: 4 }}>
                    <CircularProgress color="secondary" size={16} />
                  </Box>
                )}
                {!isFetchingNextPage && (
                  <Button color="primary" onClick={() => fetchNextPage()}>
                    Load more data
                  </Button>
                )}
              </Box>
            )}
          </Fragment>
        )}
      </Box>
    </TDefault>
  )
}

export default OTable
