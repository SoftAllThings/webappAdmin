import React from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LogoutOutlined } from "@mui/icons-material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import PoopRecordsList from "./components/PoopRecordsList";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  // Make it mobile-friendly
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 8,
          paddingRight: 8,
          "@media (min-width: 600px)": {
            paddingLeft: 16,
            paddingRight: 16,
          },
        },
      },
    },
  },
});

const AuthenticatedApp: React.FC = () => {
  const { logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isMobile ? "PoopCheck" : "PoopCheck Admin"}
          </Typography>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutOutlined />}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? "" : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: { xs: 2, md: 4 } }}>
          <Typography
            variant={isMobile ? "h4" : "h2"}
            component="h1"
            gutterBottom
            align="center"
          >
            {isMobile ? "Admin Panel" : "PoopCheck Admin"}
          </Typography>
          {!isMobile && (
            <Typography
              variant="h6"
              component="p"
              gutterBottom
              align="center"
              color="text.secondary"
            >
              Manage and analyze poop records with images and health data
            </Typography>
          )}
        </Box>

        <PoopRecordsList />
      </Container>
    </>
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
