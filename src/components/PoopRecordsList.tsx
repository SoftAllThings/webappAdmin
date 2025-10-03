import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Pagination,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { usePoopRecords } from "../hooks/usePoopData";
import PoopRecordCard from "./PoopRecordCard";
import PoopRecordModal from "./PoopRecordModal";
import { PoopRecord } from "../types/poop";

const PoopRecordsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<PoopRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { records, totalRecords, loading, error, refetch } = usePoopRecords(
    page,
    limit
  );

  const totalPages = Math.ceil(totalRecords / limit);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
    setPage(1); // Reset to first page when changing limit
  };

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
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Poop Records ({totalRecords} total)
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select value={limit} label="Per Page" onChange={handleLimitChange}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {records.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No records found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {records.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <PoopRecordCard
                  record={record}
                  onClick={() => handleRecordClick(record)}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
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
