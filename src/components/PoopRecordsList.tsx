import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useInfinitePoopRecords } from "../hooks/useInfinitePoopData";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import PoopRecordCard from "./PoopRecordCard";
import PoopRecordModal from "./PoopRecordModal";
import { PoopRecord } from "../types/poop";

const PoopRecordsList: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<PoopRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { records, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useInfinitePoopRecords(10);

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(
    () => {
      console.log("🔄 Intersection triggered");
      loadMore();
    },
    { threshold: 0.1, rootMargin: "50px" }
  );

  const handleRecordClick = (record: PoopRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  const handleRecordUpdate = () => {
    refetch(); // Refresh the list after update
    handleModalClose();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        component="h1"
        sx={{ mb: 3 }}
      >
        Records ({records.length})
      </Typography>

      {records.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No records found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={isMobile ? 2 : 3}>
            {records.map((record) => (
              <Grid item xs={12} sm={6} lg={4} key={record.id}>
                <PoopRecordCard
                  record={record}
                  onClick={() => handleRecordClick(record)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Loading more indicator */}
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={32} />
            </Box>
          )}

          {/* Invisible element to trigger loading more */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              style={{ height: "20px", margin: "20px 0" }}
            />
          )}

          {/* End of data indicator */}
          {!hasMore && records.length > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 4, mb: 2 }}
            >
              All records loaded
            </Typography>
          )}
        </>
      )}

      <PoopRecordModal
        open={modalOpen}
        record={selectedRecord}
        onClose={handleModalClose}
        onUpdate={handleRecordUpdate}
      />
    </Box>
  );
};

export default PoopRecordsList;
