import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C7FD4',
      light: '#A5A8E6',
      dark: '#5558B0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#C3C3FF',
    },
    background: {
      default: '#1E1E2E',
      paper: '#181825',
    },
    text: {
      primary: '#CDD6F4',
      secondary: '#A6ADC8',
    },
    divider: 'rgba(205,214,244,0.08)',
    success: { main: '#A6E3A1' },
    warning: { main: '#F9E2AF' },
    error: { main: '#F38BA8' },
    info: { main: '#89DCEB' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    fontSize: 14,
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body2: { lineHeight: 1.6 },
    caption: { letterSpacing: '0.02em', fontSize: '0.75rem' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        *::-webkit-scrollbar { width: 5px; height: 5px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb {
          background-color: rgba(205,214,244,0.12);
          border-radius: 10px;
          transition: background-color 0.2s;
        }
        *::-webkit-scrollbar-thumb:hover { background-color: rgba(205,214,244,0.25); }
        ::selection { background: rgba(124,127,212,0.35); }
      `,
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: 'none' } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          marginBottom: 1,
          transition: 'background 0.15s, color 0.15s',
          '&.Mui-selected': {
            backgroundColor: 'rgba(124,127,212,0.22)',
            '&:hover': { backgroundColor: 'rgba(124,127,212,0.3)' },
          },
          '&:hover': { backgroundColor: 'rgba(205,214,244,0.07)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          letterSpacing: '0.01em',
        },
        contained: {
          background: 'linear-gradient(135deg, #7C7FD4 0%, #5558B0 100%)',
          boxShadow: '0 2px 12px rgba(124,127,212,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #8E91E0 0%, #6668C0 100%)',
            boxShadow: '0 4px 16px rgba(124,127,212,0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(205,214,244,0.2)',
          '&:hover': { borderColor: 'rgba(205,214,244,0.4)', backgroundColor: 'rgba(205,214,244,0.05)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background 0.15s, color 0.15s, transform 0.1s',
          '&:hover': { transform: 'scale(1.05)' },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': { borderColor: 'rgba(205,214,244,0.15)' },
            '&:hover fieldset': { borderColor: 'rgba(205,214,244,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#7C7FD4' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { height: 24, borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          fontWeight: 500,
          background: 'rgba(24,24,37,0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(205,214,244,0.12)',
          borderRadius: 6,
        },
        arrow: { color: 'rgba(24,24,37,0.95)' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1E1E2E',
          border: '1px solid rgba(205,214,244,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#181825',
          border: '1px solid rgba(205,214,244,0.12)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          borderRadius: 8,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.8rem', fontWeight: 700 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(205,214,244,0.08)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
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

