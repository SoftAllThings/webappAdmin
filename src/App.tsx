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
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899",
      light: "#f472b6",
      dark: "#db2777",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
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
    body2: {
      color: "#64748b",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: "hidden",
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
          fontWeight: 600,
          borderRadius: 12,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          },
        },
        outlined: {
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        },
        elevation2: {
          boxShadow: "0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",
        },
        elevation8: {
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#f8fafc",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6366f1",
            },
            "&.Mui-focused": {
              backgroundColor: "#fff",
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
          backgroundColor: "#f8fafc",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#6366f1",
          },
          "&.Mui-focused": {
            backgroundColor: "#fff",
          },
        },
        notchedOutline: {
          borderColor: "rgba(0,0,0,0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 48,
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
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: "nowrap",
          fontSize: "0.8rem",
        },
        head: {
          fontWeight: 700,
          backgroundColor: "#f1f5f9",
          color: "#475569",
          textTransform: "uppercase",
          fontSize: "0.7rem",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#94a3b8",
          "&.Mui-selected": {
            color: "#6366f1",
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
          "&.Mui-selected": {
            backgroundColor: "#6366f1",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#4f46e5",
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
            backgroundColor: "rgba(99, 102, 241, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.12)",
            },
          },
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
