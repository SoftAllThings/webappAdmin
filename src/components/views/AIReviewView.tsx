import React, {useEffect, useState} from "react";
import {
  Container,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import styles from './AIReview.module.css'
import PoopRecordsList from "../records/PoopRecordsList";

const AIReviewView: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(()=>{
    return ()=> setIsVisible(false)
  },[])



  return (
    <div className={styles['mainCard']}>
   {!isVisible && <button className={styles['viewButton']}onClick = {()=>setIsVisible(true)}>BEGIN THE REVIEW</button>}
  {isVisible &&  <Container
      maxWidth="lg"
      sx={{ py: { xs: 1.5, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
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
    </Container>}
    </div>
  );
};

export default AIReviewView;
