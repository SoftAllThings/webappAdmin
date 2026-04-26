import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import LoginPage from "./components/auth/LoginPage";
import AppLayout from "./components/layout/AppLayout";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9BF0FF",
      light: "#c4f5fc",
      dark: "#5ce0f4",
    },
    secondary: {
      main: "#FCFF59",
      light: "#fdff8a",
      dark: "#e8eb3e",
    },
    background: {
      default: "#0a0e1a",
      paper: "#111827",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "rgba(255,255,255,0.08)",
    error: { main: "#ff6b6b" },
    success: { main: "#4ade80" },
  },
  shape: {
    borderRadius: 14,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    h2: {
      fontWeight: 800,
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.5rem",
      "@media (min-width:600px)": {
        fontSize: "2rem",
      },
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      "@media (min-width:600px)": {
        fontSize: "1.25rem",
      },
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: "hidden",
          background: "linear-gradient(180deg, #0a0e1a 0%, #0f1629 100%)",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 12,
          paddingRight: 12,
          "@media (min-width: 600px)": {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 12,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #FCFF59 0%, #9BF0FF 100%)",
          color: "#0a0e1a",
          "&:hover": {
            background: "linear-gradient(135deg, #e8eb3e 0%, #5ce0f4 100%)",
            color: "#0a0e1a",
          },
        },
        outlined: {
          borderColor: "rgba(155, 240, 255, 0.3)",
          color: "#9BF0FF",
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
            borderColor: "#9BF0FF",
            backgroundColor: "rgba(155, 240, 255, 0.08)",
          },
        },
        text: {
          color: "#9BF0FF",
          "&:hover": {
            backgroundColor: "rgba(155, 240, 255, 0.08)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          color: "#94a3b8",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#111827",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#111827",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        },
        elevation2: {
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.04)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(155, 240, 255, 0.4)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(255,255,255,0.06)",
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.04)",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(155, 240, 255, 0.4)",
          },
          "&.Mui-focused": {
            backgroundColor: "rgba(255,255,255,0.06)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9BF0FF",
            },
          },
        },
        notchedOutline: {
          borderColor: "rgba(255,255,255,0.1)",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#64748b",
          "&.Mui-focused": {
            color: "#9BF0FF",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.15)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 48,
          color: "#94a3b8",
          "&.Mui-selected": {
            color: "#9BF0FF",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: "linear-gradient(90deg, #FCFF59, #9BF0FF)",
          height: 3,
          borderRadius: 2,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          backgroundColor: "#1a2236",
          border: "1px solid rgba(255,255,255,0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: "nowrap",
          fontSize: "0.8rem",
          borderColor: "rgba(255,255,255,0.06)",
        },
        head: {
          fontWeight: 700,
          backgroundColor: "#0f1629",
          color: "#9BF0FF",
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.06em",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(155, 240, 255, 0.03) !important",
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#475569",
          "&.Mui-selected": {
            color: "#9BF0FF",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 500,
          color: "#94a3b8",
          borderColor: "rgba(255,255,255,0.1)",
          "&.Mui-selected": {
            background: "linear-gradient(135deg, #FCFF59 0%, #9BF0FF 100%)",
            color: "#0a0e1a",
            fontWeight: 700,
            "&:hover": {
              background: "linear-gradient(135deg, #e8eb3e 0%, #5ce0f4 100%)",
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(155, 240, 255, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(155, 240, 255, 0.15)",
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(255,255,255,0.06)",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#9BF0FF",
        },
      },
    },
  },
});

const AuthenticatedApp: React.FC = () => {
  return (
    <NavigationProvider>
      <AppLayout />
    </NavigationProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
};

export default App;
