import React, { useState } from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import IconButton from '@material-ui/core/IconButton'

import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'

import TAdmin from '../templates/TAdmin'

const useStyles = makeStyles(theme => ({
  box: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.grey[300],
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
    fontSize: 'inherit',
    letterSpacing: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:focus': {
      outline: 'none',
    },
  },
  formControl: {
    width: '100%',
  },
  icon: {
    marginTop: '4px',
  },
}))

const PAdminEmployeeNew = () => {
  const classes = useStyles()

  const [role, setRole] = useState(1)
  const [branch, setBranch] = useState(1)
  const [group, setGroup] = useState(1)

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
          <Typography variant="h2">New employee</Typography>
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
                  Send invitations
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
          <Grid
            container
            spacing={1}
            wrap="nowrap"
            alignItems="stretch"
            alignContent="stretch"
          >
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                label="First name"
                fullWidth
                error
                helperText="This field is required"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                label="Last name"
                fullWidth
                error
                helperText="This field is required"
              />
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                label="Phone"
                defaultValue="+256"
                fullWidth
                error
                helperText="Invalid phone number"
              />
            </Grid>
            <Grid item xs={2}>
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
              </FormControl>
            </Grid>
            <Grid item xs={2}>
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
              </FormControl>
            </Grid>
            <Grid item>
              <IconButton disabled className={classes.icon}>
                <RemoveCircleIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={1}
            wrap="nowrap"
            alignItems="stretch"
            alignContent="stretch"
          >
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                label="First name"
                fullWidth
                helperText="&nbsp;"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                label="Last name"
                fullWidth
                helperText="&nbsp;"
              />
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                label="Phone"
                defaultValue="+256"
                fullWidth
                helperText="&nbsp;"
              />
            </Grid>
            <Grid item xs={2}>
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
              </FormControl>
            </Grid>
            <Grid item xs={2}>
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
              </FormControl>
            </Grid>
            <Grid item>
              <IconButton className={classes.icon} color="primary">
                <RemoveCircleIcon />
              </IconButton>
            </Grid>
          </Grid>
          <Box pt={1} pb={8}>
            <Button variant="contained" color="primary">
              Invite more employees at once
            </Button>
          </Box>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminEmployeeNew
