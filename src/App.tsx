import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        `
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          `
          <Typography variant="h1" component="h1" gutterBottom>
            Hello World
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Welcome to your React MUI app!
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
