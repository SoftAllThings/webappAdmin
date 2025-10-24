import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useInfinitePoopRecords } from "../hooks/useInfinitePoopData";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import PoopRecordCard from "./PoopRecordCard";
import FastPhotoEditor from "./FastPhotoEditor";
import { PoopRecord, BRISTOL_TYPES } from "../types/poop";

// Scrollable menu props for all select dropdowns - optimized for mobile
const SCROLLABLE_MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: 'min(400px, 60vh)',
    },
    sx: {
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      '& .MuiList-root': {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
};

const PoopRecordsList: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [bristolTypeFilter, setBristolTypeFilter] = useState<
    number | undefined
  >(undefined);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { records, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useInfinitePoopRecords(20, bristolTypeFilter);

  // Set up intersection observer for automatic loading
  const intersectionRef = useIntersectionObserver(
    () => {
      if (hasMore && !loading && !loadingMore) {
        console.log("🚀 Auto-loading more records via intersection observer");
        loadMore();
      }
    },
    {
      threshold: 0.1,
      rootMargin: "100px",
    }
  );

  const handleRecordClick = (record: PoopRecord) => {
    const index = records.findIndex((r) => r.id === record.id);
    if (index !== -1) {
      setSelectedIndex(index);
      setEditorOpen(true);
    }
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
  };

  const handleRecordUpdate = () => {
    refetch(); // Refresh the list after update
  };

  const handleBristolFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    console.log("🔍 Bristol filter changed to:", value);
    const newFilter = value === "all" ? undefined : parseInt(value);
    console.log("🔍 Setting bristolTypeFilter to:", newFilter);
    setBristolTypeFilter(newFilter);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{ fontWeight: 600 }}
        >
          Records ({records.length})
        </Typography>
        {isMobile && records.length > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Tap to edit
          </Typography>
        )}
      </Box>

      {/* Bristol Type Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="bristol-type-filter-label">
            Filter by Bristol Type
          </InputLabel>
          <Select
            labelId="bristol-type-filter-label"
            id="bristol-type-filter"
            value={bristolTypeFilter?.toString() || "all"}
            label="Filter by Bristol Type"
            onChange={handleBristolFilterChange}
            MenuProps={SCROLLABLE_MENU_PROPS}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.entries(BRISTOL_TYPES).map(([type, description]) => (
              <MenuItem key={type} value={type}>
                Type {type}: {description}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {records.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No records found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={isMobile ? 1.5 : 3}>
            {records.map((record) => (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <PoopRecordCard
                  record={record}
                  onClick={() => handleRecordClick(record)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Show pagination info and load more */}
          {records.length > 0 && (
            <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {records.length} records
              </Typography>

              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  {loadingMore ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        cursor: "pointer",
                        textDecoration: "underline",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                        },
                        padding: "8px",
                        borderRadius: "4px",
                      }}
                      onClick={loadMore}
                    >
                      Load More Records
                    </Typography>
                  )}
                </Box>
              )}

              {/* Intersection observer target */}
              <div
                ref={intersectionRef}
                style={{ height: "20px", marginTop: "20px" }}
              />
            </Box>
          )}
        </>
      )}

      <FastPhotoEditor
        open={editorOpen}
        records={records}
        initialIndex={selectedIndex}
        onClose={handleEditorClose}
        onUpdate={handleRecordUpdate}
      />
    </Box>
  );
};

export default PoopRecordsList;
