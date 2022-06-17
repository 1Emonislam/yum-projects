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

const PGroupEdit = () => {
  const classes = useStyles()

  const [branch, setBranch] = useState(2)
  const [loanOfficer, setLoanOfficer] = useState(1)
  const [day, setDay] = useState(3)
  const [chairman, setChairman] = useState(1)
  const [secretary, setSecretary] = useState(1)
  const [cashier, setCashier] = useState(1)

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
          <Typography variant="h1">Group</Typography>
          <Box flexGrow={1} />
          <Box p={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Button component={Link} to="/groups/group">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/groups/group"
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
                label="Name"
                defaultValue="Roses"
                fullWidth
                helperText="&nbsp;"
              />
              <TextField
                variant="outlined"
                label="Code"
                defaultValue="G001"
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
                <InputLabel>Loan Officer</InputLabel>
                <Select
                  label="Loan Officer"
                  value={loanOfficer}
                  onChange={event => setLoanOfficer(event.target.value)}
                >
                  <MenuItem value={1}>Matovu, Tom</MenuItem>
                  <MenuItem value={2}>Lastname, Firstname</MenuItem>
                  <MenuItem value={3}>Lastname, Firstname</MenuItem>
                  <MenuItem value={4}>Lastname, Firstname</MenuItem>
                  <MenuItem value={5}>Lastname, Firstname</MenuItem>
                  <MenuItem value={6}>Lastname, Firstname</MenuItem>
                  <MenuItem value={7}>Lastname, Firstname</MenuItem>
                  <MenuItem value={8}>Lastname, Firstname</MenuItem>
                </Select>
                <FormHelperText>&nbsp;</FormHelperText>
              </FormControl>
            </Box>
            <Box pt={space}>
              <Box pb={3}>
                <Typography variant="h2">Meetings</Typography>
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
                label="Latitude"
                defaultValue="-0.342843"
                fullWidth
                helperText="&nbsp;"
              />
              <TextField
                variant="outlined"
                label="Longitude"
                defaultValue="31.736565"
                fullWidth
                helperText="&nbsp;"
              />
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Day</InputLabel>
                <Select
                  label="Day"
                  value={day}
                  onChange={event => setDay(event.target.value)}
                >
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                  <MenuItem value={7}>Sunday</MenuItem>
                </Select>
                <FormHelperText>&nbsp;</FormHelperText>
              </FormControl>
              <TextField
                variant="outlined"
                label="Time"
                defaultValue="16:30"
                fullWidth
                helperText="&nbsp;"
              />
            </Box>
            <Box pt={space}>
              <Box pb={3}>
                <Typography variant="h2">Roles</Typography>
              </Box>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>President</InputLabel>
                <Select
                  label="President"
                  value={chairman}
                  onChange={event => setChairman(event.target.value)}
                >
                  <MenuItem value={1}>Lastname, Firstname</MenuItem>
                  <MenuItem value={2}>Lastname, Firstname</MenuItem>
                  <MenuItem value={3}>Lastname, Firstname</MenuItem>
                  <MenuItem value={4}>Lastname, Firstname</MenuItem>
                  <MenuItem value={5}>Lastname, Firstname</MenuItem>
                  <MenuItem value={6}>Lastname, Firstname</MenuItem>
                  <MenuItem value={7}>Lastname, Firstname</MenuItem>
                  <MenuItem value={8}>Lastname, Firstname</MenuItem>
                  <MenuItem value={9}>Lastname, Firstname</MenuItem>
                </Select>
                <FormHelperText>&nbsp;</FormHelperText>
              </FormControl>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Secretary</InputLabel>
                <Select
                  label="Secretary"
                  value={secretary}
                  onChange={event => setSecretary(event.target.value)}
                >
                  <MenuItem value={1}>Lastname, Firstname</MenuItem>
                  <MenuItem value={2}>Lastname, Firstname</MenuItem>
                  <MenuItem value={3}>Lastname, Firstname</MenuItem>
                  <MenuItem value={4}>Lastname, Firstname</MenuItem>
                  <MenuItem value={5}>Lastname, Firstname</MenuItem>
                  <MenuItem value={6}>Lastname, Firstname</MenuItem>
                  <MenuItem value={7}>Lastname, Firstname</MenuItem>
                  <MenuItem value={8}>Lastname, Firstname</MenuItem>
                  <MenuItem value={9}>Lastname, Firstname</MenuItem>
                </Select>
                <FormHelperText>&nbsp;</FormHelperText>
              </FormControl>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Cashier</InputLabel>
                <Select
                  label="Cashier"
                  value={cashier}
                  onChange={event => setCashier(event.target.value)}
                >
                  <MenuItem value={1}>Lastname, Firstname</MenuItem>
                  <MenuItem value={2}>Lastname, Firstname</MenuItem>
                  <MenuItem value={3}>Lastname, Firstname</MenuItem>
                  <MenuItem value={4}>Lastname, Firstname</MenuItem>
                  <MenuItem value={5}>Lastname, Firstname</MenuItem>
                  <MenuItem value={6}>Lastname, Firstname</MenuItem>
                  <MenuItem value={7}>Lastname, Firstname</MenuItem>
                  <MenuItem value={8}>Lastname, Firstname</MenuItem>
                  <MenuItem value={9}>Lastname, Firstname</MenuItem>
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
                Delete this group
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </TDefault>
  )
}

export default PGroupEdit
