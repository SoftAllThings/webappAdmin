import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Assessment as AIIcon,
  Analytics as AnalyticsIcon,
  BarChart,
  LogoutOutlined,
  Close,
} from "@mui/icons-material";
import { useNavigation } from "../../contexts/NavigationContext";
import { useAuth } from "../../contexts/AuthContext";
import { TabId, NavigationItem } from "../../types/navigation";
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


interface AppSidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  isMobile: boolean;

    statsOpen: boolean;
  handleCloseStats: () => void;
  statsLoading: boolean;
  statsError: string | null;
  summaryStats: SummaryStats | null;
  stats: BristolStat[];
  handleOpenStats: ()=> Promise<void>
}





const AppSidebar: React.FC<AppSidebarProps> = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  isMobile,
  //per le stats

statsOpen,
  handleCloseStats,
  statsLoading,
  statsError,
  summaryStats,
  stats,
  handleOpenStats}) => {
  const { currentTab, setCurrentTab } = useNavigation();
  const { logout } = useAuth();

  // Stats dialog state
  // const [statsOpen, setStatsOpen] = useState(false);
  // const [stats, setStats] = useState<BristolStat[]>([]);
  // const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  // const [statsLoading, setStatsLoading] = useState(false);
  // const [statsError, setStatsError] = useState<string | null>(null);

  const navigationItems: NavigationItem[] = [
    { id: "ai-review" as TabId, label: "AI Review", icon: <AIIcon /> },
    { id: "analytics" as TabId, label: "Analytics", icon: <AnalyticsIcon /> },
  ];

  // const handleOpenStats = async () => {
  //   setStatsOpen(true);
  //   setStatsLoading(true);
  //   setStatsError(null);
  //   try {
  //     const response = await poopApiService.getBristolStats();
  //     setStats(response.data.bristolStats);
  //     setSummaryStats(response.data.summary);
  //   } catch (err) {
  //     setStatsError(
  //       err instanceof Error ? err.message : "Failed to fetch stats"
  //     );
  //   } finally {
  //     setStatsLoading(false);
  //   }
  // };

  // const handleCloseStats = () => {
  //   setStatsOpen(false);
  // };

  const handleNavItemClick = (tabId: TabId) => {
    setCurrentTab(tabId);
    if (isMobile) {
      onDrawerToggle(); // Close drawer on mobile after selecting
    }
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          PoopCheck Admin
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentTab === item.id}
              onClick={() => handleNavItemClick(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Bottom Actions */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleOpenStats}>
            <ListItemIcon>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Stats" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={logout}>
            <ListItemIcon>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        {isMobile && 
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={onDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                height: "100vh",
                overflowY: "auto",
              },
            }}
          />

        }

        {/* Desktop drawer */}
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
                borderRight: 1,
                borderColor: "divider",
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Stats Dialog */}
      {/* <Dialog
        open={statsOpen}
        onClose={handleCloseStats}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
                  <Box
                    sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
                  >
                    <Typography variant="body2">
                      Total poops:{" "}
                      <strong>{summaryStats.totalPoops.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Handled:{" "}
                      <strong>
                        {summaryStats.handledPoops.toLocaleString()}
                      </strong>
                    </Typography>
                    <Typography variant="body2">
                      Ready for AI:{" "}
                      <strong>{summaryStats.readyForAI.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Remaining:{" "}
                      <strong>
                        {summaryStats.remainingToHandle.toLocaleString()}
                      </strong>
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
                <Box
                  sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Ready for AI:{" "}
                    {stats.reduce((sum, stat) => sum + stat.num, 0)}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog> */}
      {/* <StatsDialog 
      statsOpen = {statsOpen}
  handleCloseStats = {handleCloseStats}
  statsLoading = {statsLoading}
  statsError = {statsError}
  summaryStats = {summaryStats}
  stats = {stats}
      /> */}
    </>
  );
};

export default AppSidebar;
