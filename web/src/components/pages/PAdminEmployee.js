import React from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import EditIcon from '@material-ui/icons/Edit'
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled'

import MTable from '../molecules/MTable'

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
  action: {
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: '36px',
  },
}))

const PAdminEmployee = () => {
  const classes = useStyles()

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
          <Typography variant="h2">Lastname, Firstname</Typography>
          <Box flexGrow={1} />
          <Box display="flex" p={1}>
            <Button
              startIcon={<PauseCircleFilledIcon />}
              className={classes.action}
            >
              Deactivate
            </Button>
            <Button
              startIcon={<EditIcon />}
              className={classes.action}
              component={Link}
              to="/admin/employees/employee/edit"
            >
              Edit
            </Button>
          </Box>
        </Box>
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          bgcolor="grey.200"
          px={2}
          pb={8}
        >
          <MTable pt={2}>
            <TableBody>
              <TableRow>
                <TableCell>Status:</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="50">Phone:</TableCell>
                <TableCell>+256758200281</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Role:</TableCell>
                <TableCell>Loan Officer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Branch:</TableCell>
                <TableCell>Kampala #1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Groups:</TableCell>
                <TableCell>Roses, Orchids, Tulips</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Invited:</TableCell>
                <TableCell>03/03/2021, 13:48</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Joined:</TableCell>
                <TableCell>03/03/2021, 13:55</TableCell>
              </TableRow>
            </TableBody>
          </MTable>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminEmployee
