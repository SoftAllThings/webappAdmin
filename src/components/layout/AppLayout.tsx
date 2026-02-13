import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import AppSidebar from "./AppSidebar";
import { useNavigation } from "../../contexts/NavigationContext";
import AIReviewView from "../views/AIReviewView";
import AnalyticsView from "../views/AnalyticsView";
import {IconButton} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { poopApiService } from "../../services/poopApiService";
import StatsDialog from "./StatsDialog";



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

const DRAWER_WIDTH = 240;

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(true);
  const { currentTab } = useNavigation();

  //per stats
  const [statsOpen, setStatsOpen] = useState(false);
    const [stats, setStats] = useState<BristolStat[]>([]);
      const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
      const [statsLoading, setStatsLoading] = useState(false);
      const [statsError, setStatsError] = useState<string | null>(null);

    const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenStats = async () => {
    setStatsOpen(true);
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await poopApiService.getBristolStats();
      setStats(response.data.bristolStats);
      setSummaryStats(response.data.summary);
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "Failed to fetch stats"
      );
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCloseStats = () => {
    setStatsOpen(false);
  };

  return (
    <>
    
      {isMobile && (
  <IconButton
    onClick={handleDrawerToggle}
    sx={{ position: "fixed", top: 12, left: 12, zIndex: 1300 }}
  >
    <MenuIcon />
  </IconButton>
)}
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppSidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}

        //per le stats
        handleOpenStats = {handleOpenStats}
        statsOpen = {statsOpen}
        handleCloseStats = {handleCloseStats}
        statsLoading = {statsLoading}
        statsError = {statsError}
        summaryStats = {summaryStats}
        stats = {stats}
      />

      <StatsDialog
  statsOpen={statsOpen}
  handleCloseStats={handleCloseStats}
  statsLoading={statsLoading}
  statsError={statsError}
  summaryStats={summaryStats}
  stats={stats}
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
        {currentTab === "ai-review" && <AIReviewView 
           handleOpenStats = {handleOpenStats}
        statsOpen = {statsOpen}
        handleCloseStats = {handleCloseStats}
        statsLoading = {statsLoading}
        statsError = {statsError}
        summaryStats = {summaryStats}
        stats = {stats}
        />}
        {currentTab === "analytics" && <AnalyticsView />}
      </Box>
    </Box>
    </>
  );
};

export default AppLayout;
