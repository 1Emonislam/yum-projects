import React from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import TAdmin from '../templates/TAdmin'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  bar: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
  },
  button: {
    background: 'none',
    border: 0,
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  warning: {
    paddingLeft: 12,
    borderLeft: '8px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
  chip: {
    backgroundColor: theme.palette.warning.main,
  },
  formControl: {
    width: '100%',
  },
  danger: {
    background: theme.palette.error.main,
    color: '#fff',
  },
}))

const PAdminBranchEdit = () => {
  const classes = useStyles()

  const space = 4

  return (
    <TAdmin active="branches">
      <Box display="flex" flexDirection="column" width="100%">
        <Box
          display="flex"
          alignItems="center"
          pl={2}
          pr={1}
          className={classes.bar}
          height={53}
          flexShrink={0}
        >
          <Typography variant="h2">Branch</Typography>
          <Box flexGrow={1} />
          <Box p={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Button component={Link} to="/admin/branches/branch">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin/branches/branch"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          pl={2}
          pr={1}
          pt={2}
          pb={8}
        >
          <Box display="flex" justifyContent="center">
            <Box width={460}>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Basic information</Typography>
                </Box>
                <TextField
                  variant="outlined"
                  label="Name"
                  defaultValue="Roses"
                  fullWidth
                  helperText="&nbsp;"
                />
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Address</Typography>
                </Box>
                <TextField
                  variant="outlined"
                  label="Street"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Village/Area"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Sub–county"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="County"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="District"
                  fullWidth
                  helperText="&nbsp;"
                />
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Details</Typography>
                </Box>
                <TextField
                  variant="outlined"
                  label="Servicing banks"
                  fullWidth
                  multiline
                  helperText="One bank per line"
                />
                <TextField
                  variant="outlined"
                  label="Major competitors"
                  multiline
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Outreach"
                  multiline
                  fullWidth
                  helperText="&nbsp;"
                />
              </Box>
              <Box pt={space} pb={space * 2}>
                <Box pb={3}>
                  <Typography variant="h2" color="error">
                    Danger zone
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.danger}
                >
                  Delete this branch
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminBranchEdit
