import React, { useState } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import AppSidebar from "./AppSidebar";
import { useNavigation } from "../../contexts/NavigationContext";
import AIReviewView from "../views/AIReviewView";
import AnalyticsView from "../views/AnalyticsView";
import V2AnalyticsView from "../views/V2AnalyticsView";
import ProductAnalyticsView from "../views/ProductAnalyticsView";
import InsightsView from "../views/InsightsView";
import BlogView from "../views/BlogView";
import ChatView from "../views/ChatView";
import ModelComparisonView from "../views/ModelComparisonView";
import {
  Assessment as AIIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  MoreHoriz as MoreIcon,
  Chat as AnalystIcon,
  BarChart,
  LogoutOutlined,
} from "@mui/icons-material";
import { poopApiService } from "../../services/poopApiService";
import StatsDialog from "./StatsDialog";
import { useAuth } from "../../contexts/AuthContext";
import { TabId } from "../../types/navigation";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentTab, setCurrentTab } = useNavigation();
  const { logout } = useAuth();

  // More menu state (mobile bottom nav)
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  // Stats state
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

  const bottomNavValue = ["ai-review", "analytics", "v2-analytics", "product-analytics"].includes(currentTab)
    ? currentTab
    : "ai-review";

  return (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AppSidebar
            drawerWidth={DRAWER_WIDTH}
            mobileOpen={mobileOpen}
            onDrawerToggle={handleDrawerToggle}
            isMobile={isMobile}
            handleOpenStats={handleOpenStats}
            statsOpen={statsOpen}
            handleCloseStats={handleCloseStats}
            statsLoading={statsLoading}
            statsError={statsError}
            summaryStats={summaryStats}
            stats={stats}
          />
        )}

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
            pt: "env(safe-area-inset-top)",
            pb: { xs: "calc(120px + env(safe-area-inset-bottom))", md: 0 },
            overflowX: "hidden",
          }}
        >
          {currentTab === "ai-review" && (
            <AIReviewView
              handleOpenStats={handleOpenStats}
              statsOpen={statsOpen}
              handleCloseStats={handleCloseStats}
              statsLoading={statsLoading}
              statsError={statsError}
              summaryStats={summaryStats}
              stats={stats}
            />
          )}
          {currentTab === "analytics" && <AnalyticsView />}
          {currentTab === "v2-analytics" && <V2AnalyticsView />}
          {currentTab === "product-analytics" && <ProductAnalyticsView />}
          {currentTab === "insights" && <InsightsView />}
          {currentTab === "analyst" && <ChatView />}
          {currentTab === "blog" && <BlogView />}
          {currentTab === "model-comparison" && <ModelComparisonView />}
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 0,
            pb: "env(safe-area-inset-bottom)",
            backdropFilter: "blur(24px)",
            backgroundColor: "rgba(10, 14, 26, 0.85)",
          }}
          elevation={0}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(_, newValue) => {
              if (newValue === "more") return;
              setCurrentTab(newValue as TabId);
            }}
            showLabels
            sx={{
              height: 64,
              backgroundColor: "transparent",
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                px: 0.5,
                pt: 1.5,
                pb: 0.5,
                transition: "color 0.2s ease",
                "& .MuiSvgIcon-root": { fontSize: "1.6rem" },
                "& .MuiBottomNavigationAction-label": {
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  mt: 0.5,
                  "&.Mui-selected": { fontSize: "0.72rem", fontWeight: 700 },
                },
              },
            }}
          >
            <BottomNavigationAction label="Review" value="ai-review" icon={<AIIcon />} />
            <BottomNavigationAction label="Analytics" value="analytics" icon={<AnalyticsIcon />} />
            <BottomNavigationAction label="V2" value="v2-analytics" icon={<InsightsIcon />} />
            <BottomNavigationAction label="Product" value="product-analytics" icon={<TrendingUpIcon />} />
            <BottomNavigationAction
              label="More"
              value="more"
              icon={<MoreIcon />}
              onClick={(e) => setMoreAnchor(e.currentTarget)}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* More menu (mobile) */}
      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MenuItem
          onClick={() => {
            setMoreAnchor(null);
            setCurrentTab("analyst");
          }}
        >
          <ListItemIcon><AnalystIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Analyst</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMoreAnchor(null);
            handleOpenStats();
          }}
        >
          <ListItemIcon><BarChart fontSize="small" /></ListItemIcon>
          <ListItemText>Stats</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMoreAnchor(null);
            logout();
          }}
        >
          <ListItemIcon><LogoutOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AppLayout;
