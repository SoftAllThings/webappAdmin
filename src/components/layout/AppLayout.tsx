import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import AppSidebar from "./AppSidebar";
import { useNavigation } from "../../contexts/NavigationContext";
import AIReviewView from "../views/AIReviewView";
import AnalyticsView from "../views/AnalyticsView";

const DRAWER_WIDTH = 240;

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentTab } = useNavigation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppSidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          //ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        {currentTab === "ai-review" && <AIReviewView />}
        {currentTab === "analytics" && <AnalyticsView />}
      </Box>
    </Box>
  );
};

export default AppLayout;
