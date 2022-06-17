import React, { useState } from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
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

const PAdminEmployeeEdit = () => {
  const classes = useStyles()

  const [role, setRole] = useState(1)
  const [branch, setBranch] = useState(1)
  const [group, setGroup] = useState(1)

  const space = 4

  return (
    <TAdmin active="employees">
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
          <Typography variant="h2">Employee</Typography>
          <Box flexGrow={1} />
          <Box p={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Button component={Link} to="/admin/employees">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin/employees"
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
                  label="First name"
                  defaultValue="John"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Last name"
                  defaultValue="Doe"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Phone number"
                  defaultValue="+256758200281"
                  fullWidth
                  helperText="&nbsp;"
                />
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={role}
                    onChange={event => setRole(event.target.value)}
                  >
                    <MenuItem value={1}>Loan Officer</MenuItem>
                    <MenuItem value={2}>Branch Manager</MenuItem>
                    <MenuItem value={3}>Admin</MenuItem>
                  </Select>
                  <FormHelperText>&nbsp;</FormHelperText>
                </FormControl>
                <FormControl variant="outlined" className={classes.formControl}>
                  <InputLabel>Branch</InputLabel>
                  <Select
                    label="Branch"
                    value={branch}
                    onChange={event => setBranch(event.target.value)}
                  >
                    <MenuItem value={1}>Kampala #1</MenuItem>
                    <MenuItem value={2}>Kampala #2</MenuItem>
                  </Select>
                  <FormHelperText>&nbsp;</FormHelperText>
                </FormControl>
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
                  Delete this employee
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminEmployeeEdit
