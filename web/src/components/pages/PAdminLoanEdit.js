import React, { useState } from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import AddCircleIcon from '@material-ui/icons/AddCircle'
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle'

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
  iconButton: {
    margin: '3px 5px 0',
  },
  danger: {
    background: theme.palette.error.main,
    color: '#fff',
  },
  textFieldInTableCell: {
    paddingBottom: '4px',
  },
}))

const charges = {
  12: 8,
  16: 10,
  20: 13,
  32: 19,
  40: 26,
}

const advanceInstallments = {
  12: 2,
  16: 3,
  20: 4,
  32: 5,
  40: 7,
}

const PAdminLoanEdit = () => {
  const classes = useStyles()

  const space = 4

  const [loanProcessingFeeType, setLoanProcessingFeeType] = useState('fixed')

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
          <Typography variant="h2">Loan</Typography>
          <Box flexGrow={1} />
          <Box p={1}>
            <Grid container spacing={1}>
              <Grid item>
                <Button component={Link} to="/admin/loans/loan">
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin/loans/loan"
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
                  defaultValue="Small Loan"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Loan insurance"
                  defaultValue="1"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">%</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  variant="outlined"
                  label="First loan disbursement"
                  defaultValue="14"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">After</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="start">
                        days of enrolment
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Risk cover"
                  defaultValue="LOP will be written-off and member savings will be returned"
                  multiline
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="Disbursement"
                  defaultValue="Cash disbursement from branch"
                  multiline
                  fullWidth
                  helperText="&nbsp;"
                />
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Security &amp; savings</Typography>
                </Box>
                <TextField
                  variant="outlined"
                  label="Initial loan"
                  defaultValue="10"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">%</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  variant="outlined"
                  label="Further loans"
                  defaultValue="15"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">%</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box pt={space}>
                <Box>
                  <Typography variant="h2">Loan processing fee</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <RadioGroup
                    aria-label="type"
                    row
                    name="type"
                    value={loanProcessingFeeType}
                    onChange={event =>
                      setLoanProcessingFeeType(event.target.value)
                    }
                  >
                    <FormControlLabel
                      value="fixed"
                      control={<Radio />}
                      label="Fixed amount"
                    />
                    <FormControlLabel
                      value="percentage"
                      control={<Radio />}
                      label="Percentage"
                    />
                  </RadioGroup>
                  <Box flexShrink={1} width={110} pt={3}>
                    {loanProcessingFeeType === 'fixed' && (
                      <TextField
                        variant="outlined"
                        label="Amount"
                        defaultValue="1000"
                        fullWidth
                        helperText="&nbsp;"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              USh
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    {loanProcessingFeeType === 'percentage' && (
                      <TextField
                        variant="outlined"
                        label="Percentage"
                        defaultValue="1"
                        fullWidth
                        helperText="&nbsp;"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Durations</Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell>
                            <Typography>{duration} weeks</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" edge="end">
                              <RemoveCircleIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box pt={1} display="flex" alignItems="flex-start">
                  <TextField
                    variant="outlined"
                    placeholder="Enter a number of"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">weeks</InputAdornment>
                      ),
                    }}
                    fullWidth
                    helperText="&nbsp;"
                  />
                  <IconButton className={classes.iconButton} color="primary">
                    <AddCircleIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Initial loan</Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell>
                            <Typography>{duration}&nbsp;weeks</Typography>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue="250000"
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      USh
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue="600000"
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      USh
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">
                    Loan increment each cycle
                  </Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell>
                            <Typography>{duration}&nbsp;weeks</Typography>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue="75000"
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      USh
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue="200000"
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      USh
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Service charge</Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell>Charge</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell width="50">
                            <Typography>{duration}&nbsp;weeks</Typography>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue={charges[duration]}
                                type="number"
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="start">
                                      %
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Advance installments</Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell>Installments</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell width="50">
                            <Typography>{duration}&nbsp;weeks</Typography>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue={advanceInstallments[duration]}
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      Last
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="start">
                                      installments
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Loan ceiling</Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration</TableCell>
                        <TableCell>Limit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[12, 16, 20, 32, 40].map(duration => (
                        <TableRow key={duration}>
                          <TableCell width="50">
                            <Typography>{duration}&nbsp;weeks</Typography>
                          </TableCell>
                          <TableCell>
                            <Box className={classes.textFieldInTableCell}>
                              <TextField
                                variant="outlined"
                                defaultValue="2000000"
                                type="number"
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      USh
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">Required guarantors</Typography>
                </Box>
                <TextField
                  variant="outlined"
                  label="From group"
                  defaultValue="1"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                />
                <TextField
                  variant="outlined"
                  label="From family"
                  defaultValue="1"
                  type="number"
                  fullWidth
                  helperText="&nbsp;"
                />
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">
                    Required documents (initial loan)
                  </Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableBody>
                      {[
                        'National ID or Voter ID photo',
                        'Photo of the client',
                        'Local Council certificate',
                      ].map(document => (
                        <TableRow key={document}>
                          <TableCell>
                            <Typography>{document}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box height={30}>
                              {document !== 'National ID or Voter ID photo' &&
                                document !== 'Photo of the client' && (
                                  <IconButton size="small" edge="end">
                                    <RemoveCircleIcon />
                                  </IconButton>
                                )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box pt={1} display="flex" alignItems="flex-start">
                  <TextField
                    variant="outlined"
                    placeholder="Enter a document name"
                    fullWidth
                    helperText="&nbsp;"
                  />
                  <IconButton className={classes.iconButton} color="primary">
                    <AddCircleIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box pt={space}>
                <Box pb={3}>
                  <Typography variant="h2">
                    Required documents (further loans)
                  </Typography>
                </Box>
                <TableContainer
                  component={Box}
                  border={1}
                  borderBottom={0}
                  borderColor="grey.200"
                >
                  <Table>
                    <TableBody>
                      {[
                        'National ID or Voter ID photo',
                        'Photo of the client',
                      ].map(document => (
                        <TableRow key={document}>
                          <TableCell>
                            <Typography>{document}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box height={30}>
                              {/* <IconButton size="small" edge="end">
                                <RemoveCircleIcon />
                              </IconButton> */}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box pt={1} display="flex" alignItems="flex-start">
                  <TextField
                    variant="outlined"
                    placeholder="Enter a document name"
                    fullWidth
                    helperText="&nbsp;"
                  />
                  <IconButton className={classes.iconButton} color="primary">
                    <AddCircleIcon />
                  </IconButton>
                </Box>
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
                  Delete this loan
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </TAdmin>
  )
}

export default PAdminLoanEdit
