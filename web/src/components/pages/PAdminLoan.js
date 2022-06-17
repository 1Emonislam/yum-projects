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

const PAdminLoan = () => {
  const classes = useStyles()

  return (
    <TAdmin active="loans">
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
          <Typography variant="h2">Small Loan</Typography>
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
              to="/admin/loans/loan/edit"
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
                <TableCell width="220">Loan processing fee:</TableCell>
                <TableCell>1%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Security &amp; savings:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>Initial loan: 10%</li>
                    <li>Further loans: 15%</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Initial loan:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>12 weeks: USh 250,000–600,000</li>
                    <li>16 weeks: USh 250,000–600,000</li>
                    <li>20 weeks: USh 250,000–600,000</li>
                    <li>32 weeks: USh 250,000–800,000</li>
                    <li>40 weeks: USh 250,000–800,000</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loan increment each cycle:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>12 weeks: USh 75,000–200,000</li>
                    <li>16 weeks: USh 75,000–200,000</li>
                    <li>20 weeks: USh 75,000–200,000</li>
                    <li>32 weeks: USh 75,000–200,000</li>
                    <li>40 weeks: USh 75,000–200,000</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>First loan disbursement:</TableCell>
                <TableCell>After 14 days of enrolment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Service charge:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>12 weeks: 8%</li>
                    <li>16 weeks: 10%</li>
                    <li>20 weeks: 13%</li>
                    <li>32 weeks: 19%</li>
                    <li>40 weeks: 26%</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loan insurance:</TableCell>
                <TableCell>1%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Risk cover:</TableCell>
                <TableCell>
                  LOP will be written-off and member savings will be returned
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Advance installments:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>12 weeks: last 2 installments</li>
                    <li>16 weeks: last 3 installments</li>
                    <li>20 weeks: last 4 installments</li>
                    <li>32 weeks: last 5 installments</li>
                    <li>40 weeks: last 7 installments</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Loan ceiling:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>12 weeks: USh 2,000,000</li>
                    <li>16 weeks: USh 2,000,000</li>
                    <li>20 weeks: USh 2,000,000</li>
                    <li>32 weeks: USh 2,000,000</li>
                    <li>40 weeks: USh 2,000,000</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Guarantors:</TableCell>
                <TableCell>
                  <ul className="list-interpunct">
                    <li>1 from group</li>
                    <li>1 from family</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Required documents:</TableCell>
                <TableCell>
                  Initial loan:
                  <br />
                  <ul className="list-interpunct">
                    <li>National ID or Voter ID photo</li>
                    <li>Photo of the client</li>
                    <li>Local Council certificate</li>
                  </ul>
                  Further loans:
                  <br />
                  <ul className="list-interpunct">
                    <li>National ID or Voter ID photo</li>
                    <li>Photo of the client</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Disbursement:</TableCell>
                <TableCell>Cash disbursement from branch</TableCell>
              </TableRow>
            </TableBody>
          </MTable>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminLoan
