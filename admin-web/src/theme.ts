import type {} from '@mui/x-data-grid/themeAugmentation';
import { createTheme, type PaletteMode } from '@mui/material/styles';

export function buildTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#1f8f2e',
      },
      secondary: {
        main: '#3dbb5d',
      },
      background: {
        default: isDark ? '#0f1711' : '#f4f7f4',
        paper: isDark ? '#18221a' : '#ffffff',
      },
      success: {
        main: '#22c55e',
      },
      warning: {
        main: '#f59e0b',
      },
      error: {
        main: '#ef4444',
      },
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid rgba(148, 163, 184, 0.14)',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
          },
        },
      },
    },
  });
}
