import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
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
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom align="center">
            PoopCheck Admin
          </Typography>
          <Typography
            variant="h6"
            component="p"
            gutterBottom
            align="center"
            color="text.secondary"
          >
            Manage and analyze poop records with images and health data
          </Typography>

          <Box sx={{ mt: 4 }}>
            <PoopRecordsList />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App;
