import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6264A7',
      light: '#8B8CC8',
      dark: '#4B4D8A',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C3C3FF',
    },
    background: {
      default: '#292828',
      paper: '#1F1F1F',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#ADADAD',
    },
    divider: 'rgba(255,255,255,0.08)',
    success: { main: '#22C55E' },
    warning: { main: '#EAB308' },
    error: { main: '#EF4444' },
  },
  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    fontSize: 14,
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    caption: { letterSpacing: '0.02em' },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        * { box-sizing: border-box; }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.15); border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.25); }
      `,
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: 'none' } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          marginBottom: 1,
          '&.Mui-selected': {
            backgroundColor: 'rgba(98,100,167,0.2)',
            '&:hover': { backgroundColor: 'rgba(98,100,167,0.28)' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiChip: {
      styleOverrides: {
        root: { height: 24, borderRadius: 4 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: 'none', backgroundColor: '#2D2C2C' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { backgroundImage: 'none', backgroundColor: '#2D2C2C' },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.8rem', fontWeight: 600 },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
)

