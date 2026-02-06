import React from "react";
import {
  Container,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PoopRecordsList from "../records/PoopRecordsList";

const AIReviewView: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>test 1 </div>
    // <Container
    //   maxWidth="lg"
    //   sx={{ py: { xs: 1.5, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
    // >
    //   {!isMobile && (
    //     <Box sx={{ mb: { xs: 2, md: 4 } }}>
    //       <Typography
    //         variant="h2"
    //         component="h1"
    //         gutterBottom
    //         align="center"
    //         sx={{ fontWeight: 600 }}
    //       >
    //         PoopCheck Admin
    //       </Typography>
    //       <Typography
    //         variant="h6"
    //         component="p"
    //         gutterBottom
    //         align="center"
    //         color="text.secondary"
    //       >
    //         Manage and analyze records with images and health data
    //       </Typography>
    //     </Box>
    //   )}

    //   <PoopRecordsList />
    // </Container>
  );
};

export default AIReviewView;
