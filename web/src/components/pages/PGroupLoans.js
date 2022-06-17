import React from 'react'

import { useHistory } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'

import TGroup from '../templates/TGroup'

const useStyles = makeStyles(theme => ({
  warning: {
    paddingLeft: 12,
    borderLeft: '4px solid',
    borderLeftColor: theme.palette.warning.main,
    '& svg': {
      marginLeft: -16,
    },
  },
}))

const PGroupLoans = () => {
  const classes = useStyles()

  const history = useHistory()

  return (
    <TGroup active="loans">
      {/* <Box pl={2} pt={1}>
        <TextField label="Search" variant="outlined" />
      </Box> */}
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Client</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Last update</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell className={classes.warning}>Pending</TableCell>
              <TableCell>Nakalema, Justine</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(565000)}
              </TableCell>
              <TableCell align="right">23/02/2021</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell className={classes.warning}>Late 1</TableCell>
              <TableCell>Kivumbi, Samali</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(960000)}
              </TableCell>
              <TableCell align="right">03/11/2020</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell>Active</TableCell>
              <TableCell>Nakazzi, Zaituni</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(565000)}
              </TableCell>
              <TableCell align="right">19/01/2021</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell>Active</TableCell>
              <TableCell>Nakajjugo, Rose</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(452000)}
              </TableCell>
              <TableCell align="right">19/01/2021</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell>Active</TableCell>
              <TableCell>Namugerwa, Jackline</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(600000)}
              </TableCell>
              <TableCell align="right">12/01/2021</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell>Active</TableCell>
              <TableCell>Namutebi, Jamia</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(678000)}
              </TableCell>
              <TableCell align="right">18/12/2020</TableCell>
            </TableRow>
            <TableRow
              hover
              onClick={() => history.push(`/clients/client/loans/loan`)}
            >
              <TableCell>Active</TableCell>
              <TableCell>Kabwiizi, Betty</TableCell>
              <TableCell align="right">
                {new Intl.NumberFormat('en-Ug', {
                  style: 'currency',
                  currency: 'UGX',
                }).format(1240000)}
              </TableCell>
              <TableCell align="right">07/02/2021</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </TGroup>
  )
}

export default PGroupLoans
