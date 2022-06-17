import React, { Fragment } from 'react'

import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  logo: {
    position: 'fixed',
    top: '15px',
    left: '10px',
    textDecoration: 'none',
  },
  logoImg: {
    height: '18px',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  version: {
    color: theme.palette.grey[400],
    marginLeft: 10,
  },
}))

const TMinimal = ({ children }) => {
  const classes = useStyles()

  return (
    <Fragment>
      <Link className={classes.logo} to="/">
        <img src="/yam-color.png" alt="Yam" className={classes.logoImg} />
        <span className={classes.version}>
          v{process.env.REACT_APP_VERSION}
        </span>
      </Link>
      <div className={classes.content}>{children}</div>
    </Fragment>
  )
}

export default TMinimal
