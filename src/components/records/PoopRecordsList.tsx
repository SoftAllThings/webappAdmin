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
import { useInfinitePoopRecords } from "../../hooks/useInfinitePoopData";
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";
import PoopRecordCard from "./PoopRecordCard";
import FastPhotoEditor from "../editor/FastPhotoEditor";
import {
  PoopRecord,
  BRISTOL_TYPES,
  COLOR_TYPES,
  CONSISTENCY_TYPES,
  FLOATING_TYPES,
  HEALTH_TYPES,
} from "../../types/poop";
import { useLastVerifiedBristolType } from "../../hooks/usePoopData";

// Scrollable menu props for all select dropdowns - optimized for mobile
const SCROLLABLE_MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: "min(400px, 60vh)",
    },
    sx: {
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      "& .MuiList-root": {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
};

type AdditionalDetailsFilter =
  | "all"
  | "blood"
  | "mucus"
  | "floating"
  | "consistency"
  | "health"
  | "color";

const PoopRecordsList: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [bristolTypeFilter, setBristolTypeFilter] = useState<
    number | undefined
  >(undefined);
  const [additionalDetailsFilter, setAdditionalDetailsFilter] =
    useState<AdditionalDetailsFilter>("all");
  const [additionalDetailsValue, setAdditionalDetailsValue] =
    useState<string>("all");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { records, loading, loadingMore, error, hasMore, loadMore, refetch } =
    useInfinitePoopRecords(100, bristolTypeFilter);

  const { lastType } = useLastVerifiedBristolType();

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
    const index = filteredRecords.findIndex((r) => r.id === record.id);
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

  const handleAdditionalDetailsFilterChange = (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value as AdditionalDetailsFilter;
    setAdditionalDetailsFilter(value);
    setAdditionalDetailsValue("all");
  };

  const handleAdditionalDetailsValueChange = (
    event: SelectChangeEvent<string>
  ) => {
    setAdditionalDetailsValue(event.target.value);
  };

  const shouldShowAdditionalDetailsValue =
    additionalDetailsFilter === "floating" ||
    additionalDetailsFilter === "consistency" ||
    additionalDetailsFilter === "health" ||
    additionalDetailsFilter === "color";

  const filteredRecords = records.filter((record) => {
    if (additionalDetailsFilter === "all") {
      return true;
    }

    if (additionalDetailsFilter === "blood") {
      return record.blood > 0;
    }

    if (additionalDetailsFilter === "mucus") {
      return record.mucus > 0;
    }

    if (
      (additionalDetailsFilter === "floating" ||
        additionalDetailsFilter === "consistency" ||
        additionalDetailsFilter === "health" ||
        additionalDetailsFilter === "color") &&
      additionalDetailsValue === "all"
    ) {
      return true;
    }

    if (additionalDetailsFilter === "floating") {
      return record.floating === Number(additionalDetailsValue);
    }

    if (additionalDetailsFilter === "consistency") {
      return record.consistency === Number(additionalDetailsValue);
    }

    if (additionalDetailsFilter === "health") {
      return record.health === Number(additionalDetailsValue);
    }

    if (additionalDetailsFilter === "color") {
      return record.color === Number(additionalDetailsValue);
    }

    return true;
  });

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{ fontWeight: 600 }}
        >
          Records ({filteredRecords.length})
        </Typography>
        {isMobile && records.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Tap to edit
          </Typography>
        )}
      </Box>

      {/* Bristol Type Filter */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          gap: 2,
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
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

        <FormControl sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="additional-details-filter-label">
            Filter by Additional Details
          </InputLabel>
          <Select
            labelId="additional-details-filter-label"
            id="additional-details-filter"
            value={additionalDetailsFilter}
            label="Filter by Additional Details"
            onChange={handleAdditionalDetailsFilterChange}
            MenuProps={SCROLLABLE_MENU_PROPS}
          >
            <MenuItem value="all">All Additional Details</MenuItem>
            <MenuItem value="blood">Blood</MenuItem>
            <MenuItem value="mucus">Mucus</MenuItem>
            <MenuItem value="color">Color</MenuItem>
            <MenuItem value="floating">Floating</MenuItem>
            <MenuItem value="consistency">Consistency</MenuItem>
            <MenuItem value="health">Health</MenuItem>
          </Select>
        </FormControl>

        {shouldShowAdditionalDetailsValue && (
          <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel id="additional-details-value-label">
              {additionalDetailsFilter === "color" && "Color"}
              {additionalDetailsFilter === "floating" && "Floating Value"}
              {additionalDetailsFilter === "consistency" && "Consistency Value"}
              {additionalDetailsFilter === "health" && "Health Value"}
            </InputLabel>
            <Select
              labelId="additional-details-value-label"
              id="additional-details-value"
              value={additionalDetailsValue}
              label={
                additionalDetailsFilter === "color"
                  ? "Color"
                  : additionalDetailsFilter === "floating"
                    ? "Floating Value"
                    : additionalDetailsFilter === "consistency"
                      ? "Consistency Value"
                      : "Health Value"
              }
              onChange={handleAdditionalDetailsValueChange}
              MenuProps={SCROLLABLE_MENU_PROPS}
            >
              <MenuItem value="all">All</MenuItem>
              {additionalDetailsFilter === "color" &&
                Object.entries(COLOR_TYPES).map(([value, description]) => (
                  <MenuItem key={value} value={value}>
                    {description}
                  </MenuItem>
                ))}
              {additionalDetailsFilter === "floating" &&
                Object.entries(FLOATING_TYPES).map(([value, description]) => (
                  <MenuItem key={value} value={value}>
                    {description}
                  </MenuItem>
                ))}
              {additionalDetailsFilter === "consistency" &&
                Object.entries(CONSISTENCY_TYPES).map(([value, description]) => (
                  <MenuItem key={value} value={value}>
                    {description}
                  </MenuItem>
                ))}
              {additionalDetailsFilter === "health" &&
                Object.entries(HEALTH_TYPES).map(([value, description]) => (
                  <MenuItem key={value} value={value}>
                    {description}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

        <Typography>
          Last Type: {lastType !== null ? lastType : "Loading..."}
        </Typography>
      </Box>

      {filteredRecords.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center", py: 4 }}
        >
          No records found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={isMobile ? 1.5 : 3}>
            {filteredRecords.map((record) => (
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
                Showing {filteredRecords.length} of {records.length} loaded
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
        records={filteredRecords}
        initialIndex={selectedIndex}
        onClose={handleEditorClose}
        onUpdate={handleRecordUpdate}
      />
    </Box>
  );
};

export default PoopRecordsList;
