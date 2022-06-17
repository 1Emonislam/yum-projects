import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import CloseIcon from '@material-ui/icons/Close'
import Dialog from '@material-ui/core/Dialog'
import IconButton from '@material-ui/core/IconButton'
import React, { Fragment, useState } from 'react'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import Image from 'material-ui-image'

const useStyles = makeStyles(theme => ({
  dialog: {
    '& .MuiDialog-paper': {
      width: '100%',
    },
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
}))

const MLoanPhoto = ({ photo, label, context }) => {
  const classes = useStyles()

  const [dialog, setDialog] = useState(false)

  return (
    <Fragment>
      <TableRow hover>
        <TableCell width="250">{label}:</TableCell>
        <TableCell>
          <button
            className={classes.button}
            onClick={() => {
              setDialog(true)
            }}
          >
            Show
          </button>
        </TableCell>
      </TableRow>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        className={classes.dialog}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p={1}
          pl={2}
          style={{ width: '100%' }}
        >
          <Typography variant="h6">{context || label}</Typography>
          <Box pl={2}>
            <IconButton onClick={() => setDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        {photo && <Image src={photo?.uri} aspectRatio={1} />}
      </Dialog>
    </Fragment>
  )
}

export default MLoanPhoto
