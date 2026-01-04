import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LogoutOutlined, BarChart, Close } from "@mui/icons-material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import PoopRecordsList from "./components/PoopRecordsList";
import { poopApiService } from "./services/poopApiService";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  // Mobile-first breakpoints
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
    // Optimize font sizes for mobile
    fontSize: 14,
    h4: {
      fontSize: "1.5rem",
      "@media (min-width:600px)": {
        fontSize: "2rem",
      },
    },
    h6: {
      fontSize: "1rem",
      "@media (min-width:600px)": {
        fontSize: "1.25rem",
      },
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
    MuiButton: {
      styleOverrides: {
        root: {
          // Larger touch targets for mobile
          minHeight: 44,
          textTransform: "none",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Larger touch targets for mobile
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
  },
});

interface BristolStat {
  bristol_type: number;
  num: number;
}

interface SummaryStats {
  totalPoops: number;
  handledPoops: number;
  readyForAI: number;
  remainingToHandle: number;
}

const AuthenticatedApp: React.FC = () => {
  const { logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<BristolStat[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleOpenStats = async () => {
    setStatsOpen(true);
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await poopApiService.getBristolStats();
      setStats(response.data.bristolStats);
      setSummaryStats(response.data.summary);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCloseStats = () => {
    setStatsOpen(false);
  };

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {isMobile ? "PoopCheck" : "PoopCheck Admin"}
          </Typography>
          <Button
            color="inherit"
            onClick={handleOpenStats}
            startIcon={!isMobile && <BarChart />}
            sx={{ mr: 1 }}
          >
            {isMobile ? <BarChart /> : "Stats"}
          </Button>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={!isMobile && <LogoutOutlined />}
            sx={{
              minWidth: isMobile ? 44 : "auto",
            }}
          >
            {isMobile ? <LogoutOutlined /> : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>

      <Dialog open={statsOpen} onClose={handleCloseStats} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Bristol Type Stats
          <IconButton onClick={handleCloseStats} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {statsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : statsError ? (
            <Typography color="error">{statsError}</Typography>
          ) : (
            <>
              {summaryStats && (
                <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Dataset Overview
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                    <Typography variant="body2">
                      Total poops: <strong>{summaryStats.totalPoops.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Handled: <strong>{summaryStats.handledPoops.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Ready for AI: <strong>{summaryStats.readyForAI.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Remaining: <strong>{summaryStats.remainingToHandle.toLocaleString()}</strong>
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                By Bristol Type (Ready for AI)
              </Typography>
              <List>
                {stats.map((stat) => (
                  <ListItem key={stat.bristol_type} divider>
                    <ListItemText
                      primary={`Type ${stat.bristol_type}`}
                      secondary={`Count: ${stat.num}`}
                    />
                  </ListItem>
                ))}
                {stats.length === 0 && (
                  <Typography color="text.secondary" align="center">
                    No data available
                  </Typography>
                )}
              </List>
              {stats.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Ready for AI: {stats.reduce((sum, stat) => sum + stat.num, 0)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Container maxWidth="lg" sx={{ py: { xs: 1.5, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        {!isMobile && (
          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 600 }}
            >
              PoopCheck Admin
            </Typography>
            <Typography
              variant="h6"
              component="p"
              gutterBottom
              align="center"
              color="text.secondary"
            >
              Manage and analyze records with images and health data
            </Typography>
          </Box>
        )}

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
