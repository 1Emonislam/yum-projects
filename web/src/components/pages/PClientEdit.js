import React, { useState } from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

// import Input from "@material-ui/core/Input";
// import InputAdornment from "@material-ui/core/InputAdornment";
// import InputBase from "@material-ui/core/InputBase";
// import InputLabel from "@material-ui/core/InputLabel";
// import TableContainer from "@material-ui/core/TableContainer";
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Grid from '@material-ui/core/Grid'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import TDefault from '../templates/TDefault'

const useStyles = makeStyles(theme => ({
  appbar: {
    borderBottomColor: theme.palette.grey[300],
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
  },
  box: {
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

const PClientEdit = () => {
  const classes = useStyles()

  const [branch, setBranch] = useState(2)
  const [group, setGroup] = useState(1)

  const space = 4

  return (
    <TDefault>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className={classes.appbar}
      >
        <Toolbar>
          <Typography variant="h1">Client</Typography>
          <Box flexGrow={1} />
          <Box p={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Button component={Link} to="/clients/client">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/clients/client"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Toolbar>
      </AppBar>
      <Box overflow="auto">
        <Box display="flex" justifyContent="center">
          <Box width={460}>
            <Box pt={space}>
              <Box pb={3}>
                <Typography variant="h2">Basic information</Typography>
              </Box>
              <TextField
                variant="outlined"
                label="First name"
                defaultValue="Firstname"
                fullWidth
                helperText="&nbsp;"
              />
              <TextField
                variant="outlined"
                label="Last name"
                defaultValue="Lastname"
                fullWidth
                helperText="&nbsp;"
              />
              <TextField
                variant="outlined"
                label="Code"
                defaultValue="C001"
                fullWidth
                helperText="&nbsp;"
              />
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
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Group</InputLabel>
                <Select
                  label="group"
                  value={group}
                  onChange={event => setGroup(event.target.value)}
                >
                  <MenuItem value={1}>Roses</MenuItem>
                  <MenuItem value={2}>Orchids</MenuItem>
                  <MenuItem value={3}>Sunflowers</MenuItem>
                  <MenuItem value={4}>Tulips</MenuItem>
                  <MenuItem value={5}>Alstroemerias</MenuItem>
                  <MenuItem value={6}>Carnations</MenuItem>
                </Select>
                <FormHelperText>&nbsp;</FormHelperText>
              </FormControl>
            </Box>
            <Box pt={space}>
              <Box pb={3}>
                <Typography variant="h2">For admission</Typography>
              </Box>
              <TextField
                variant="outlined"
                label="Address"
                defaultValue="Mpuuga Plaza, 8 Broadway Rd, Masaka"
                fullWidth
                helperText="&nbsp;"
              />
              <TextField
                variant="outlined"
                label="Notes"
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
                Delete this client
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </TDefault>
  )
}

export default PClientEdit
