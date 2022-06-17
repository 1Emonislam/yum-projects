import { createTheme } from '@material-ui/core/styles'

import { grey } from '@material-ui/core/colors'

const theme = createTheme({
  props: {
    MuiFilledInput: {
      margin: 'dense',
    },
    MuiFormControl: {
      margin: 'dense',
    },
    MuiFormHelperText: {
      margin: 'dense',
    },
    MuiInputBase: {
      margin: 'dense',
    },
    MuiInputLabel: {
      margin: 'dense',
    },
    MuiListItem: {
      dense: true,
    },
    MuiOutlinedInput: {
      margin: 'dense',
    },
    MuiTable: {
      size: 'small',
    },
    MuiTextField: {
      margin: 'dense',
    },
    MuiToolbar: {
      variant: 'dense',
      disableGutters: true,
    },
  },
  overrides: {
    MuiPaper: {
      rounded: {
        borderRadius: 0,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 0,
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: 'absolute',
        zIndex: 1201, // theme.zIndex.drawer + 1
      },
    },
    MuiDialog: {
      container: {
        position: 'relative',
        zIndex: 1202, // MuiBackdrop + 1
      },
    },
    MuiDialogContentText: {
      root: {
        fontSize: '0.875rem',
      },
    },
    MuiTouchRipple: {
      child: {
        backgroundColor: '#7fe3e3',
      },
    },
    MuiToolbar: {
      root: {
        paddingLeft: '16px',
        paddingRight: '8px',
      },
    },
    MuiTabs: {
      indicator: {
        transition: 'none',
      },
    },
    MuiTab: {
      root: {
        minWidth: 0,
        paddingLeft: 16,
        paddingRight: 16,
        '@media (min-width: 0px)': {
          minWidth: 0,
        },
      },
    },
    MuiOutlinedInput: {
      root: {
        borderRadius: 0,
      },
    },
    MuiTable: {
      root: {
        backgroundColor: '#fff',
      },
    },
    MuiInputAdornment: {
      positionStart: {
        paddingTop: '2px',
      },
    },
    // MuiTableRow: {
    //   hover: {
    //     cursor: "pointer",
    //   },
    // },
    MuiTableRow: {
      root: {
        '&.MuiTableRow-hover:hover': {
          backgroundColor: 'rgba(40, 183, 149, 0.2)',
        },
      },
    },
    MuiTableCell: {
      body: {
        borderLeftWidth: 0,
        borderBottomColor: grey[200],
      },
      stickyHeader: {
        backgroundColor: '#fff',
      },
    },
    MuiBadge: {
      dot: {
        backgroundColor: '#fff',
      },
    },
    MuiSnackbar: {
      anchorOriginBottomLeft: {
        marginLeft: '80px',
      },
    },
  },
  palette: {
    primary: {
      main: '#383838',
    },
    secondary: {
      main: '#01c8c8',
    },
    text: {
      primary: '#383838',
    },
    warning: {
      main: '#fabc76',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
      letterSpacing: 0,
    },
    h1: {
      fontFamily: 'Abhaya Libre',
      fontWeight: 700,
      fontSize: '30px',
      lineHeight: 1,
    },
    h2: {
      fontFamily: 'Abhaya Libre',
      fontWeight: 700,
      fontSize: '24px',
      lineHeight: 1,
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 400,
      letterSpacing: 0,
      lineHeight: 1.3,
    },
  },
})

export default theme
