import React from 'react'

import {
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";

import {
  Close,
} from "@mui/icons-material";

interface SummaryStats {
  totalPoops: number;
  handledPoops: number;
  readyForAI: number;
  remainingToHandle: number;
}

interface BristolStat {
  bristol_type: number;
  num: number;
}

type Props = {
  statsOpen: boolean;
  handleCloseStats: () => void;
  statsLoading: boolean;
  statsError: string | null;
  summaryStats: SummaryStats | null;
  stats: BristolStat[];
}


const StatsDialog = ({ 
  statsOpen,
  handleCloseStats,
  statsLoading,
  statsError,
  summaryStats,
  stats,}: Props) => {


  return (
    <Dialog
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
      </Dialog>
  )
}

export default StatsDialog