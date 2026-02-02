import React from "react";
import { Container, Box, Typography } from "@mui/material";

const AnalyticsView: React.FC = () => {
  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 1.5, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Analytics Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Coming Soon
        </Typography>
      </Box>
    </Container>
  );
};

export default AnalyticsView;
