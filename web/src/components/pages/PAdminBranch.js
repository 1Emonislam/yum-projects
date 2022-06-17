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

const PAdminBranch = () => {
  const classes = useStyles()

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
          <Typography variant="h2">Roses</Typography>
          <Box flexGrow={1} />
          <Box display="flex" p={1}>
            {/* <Button
              startIcon={<PauseCircleFilledIcon />}
              className={classes.action}
            >
              Deactivate
            </Button> */}
            <Button
              startIcon={<EditIcon />}
              className={classes.action}
              component={Link}
              to="/admin/branches/branch/edit"
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
                <TableCell width="172">Address:</TableCell>
                <TableCell>Mpuuga Plaza, 8 Broadway Rd, Masaka</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Branch Manager:</TableCell>
                <TableCell>
                  <Link to="/admin/employees/employee">
                    Lastname, Firstname
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loan Officers:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>
                      <Link to="/admin/employees/employee">
                        Lastname, Firstname
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/employees/employee">
                        Lastname, Firstname
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/employees/employee">
                        Lastname, Firstname
                      </Link>
                    </li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Servicing banks:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>Bank name #1</li>
                    <li>Bank name #2</li>
                    <li>Bank name #3</li>
                    <li>Bank name #4</li>
                    <li>Bank name #5</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Major competitors:</TableCell>
                <TableCell>
                  Masaka Microfinance & Development Cooperative Trust
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Outreach:</TableCell>
                <TableCell>Outreach description</TableCell>
              </TableRow>
            </TableBody>
          </MTable>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminBranch
