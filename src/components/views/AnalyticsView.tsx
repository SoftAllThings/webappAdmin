import React from "react";
import { Container, Box, Typography } from "@mui/material";
import AnalyticsSection from "../analytics/AnalyticsSection";

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

        <AnalyticsSection></AnalyticsSection>
      </Box>
    </Container>
  );
};

export default AnalyticsView;
