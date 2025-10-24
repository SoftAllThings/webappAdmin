import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  Close,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import {
  PoopRecord,
  BRISTOL_TYPES,
  CONSISTENCY_TYPES,
  SHAPE_TYPES,
  COLOR_TYPES,
  QUANTITY_TYPES,
  HEALTH_TYPES,
  MUCUS_TYPES,
  BLOOD_TYPES,
  FLOATING_TYPES,
  CONDITIONS_TYPES,
  CONDITIONS_FEATURES,
} from "../types/poop";
import { usePoopCrud } from "../hooks/usePoopData";

interface FastPhotoEditorProps {
  open: boolean;
  records: PoopRecord[];
  initialIndex: number;
  onClose: () => void;
  onUpdate: () => void;
}

const FastPhotoEditor: React.FC<FastPhotoEditorProps> = ({
  open,
  records,
  initialIndex,
  onClose,
  onUpdate,
}) => {
  const { updateRecord } = usePoopCrud();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [formData, setFormData] = useState<Partial<PoopRecord>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentRecordIdRef = useRef<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const currentRecord = records[currentIndex];

  // Initialize form data when current record changes
  useEffect(() => {
    if (currentRecord) {
      const initializedData = {
        ...currentRecord,
        bristol_type: currentRecord.bristol_type ?? 1,
        consistency: currentRecord.consistency ?? 0,
        shape: currentRecord.shape ?? 0,
        quantity: currentRecord.quantity ?? 0,
        color: currentRecord.color ?? 0,
        health: currentRecord.health ?? 0,
        blood: currentRecord.blood ?? 0,
        mucus: currentRecord.mucus ?? 0,
        floating: currentRecord.floating ?? 0,
        image_good_for_ml: currentRecord.image_good_for_ml ?? null,
        liver_flukes: currentRecord.liver_flukes ?? 0,
        colon_cancer: currentRecord.colon_cancer ?? 0,
        hemorrhoids: currentRecord.hemorrhoids ?? 0,
        anal_fissures: currentRecord.anal_fissures ?? 0,
        crohns_disease: currentRecord.crohns_disease ?? 0,
        ulcerative_colitis: currentRecord.ulcerative_colitis ?? 0,
        celiac_disease: currentRecord.celiac_disease ?? 0,
        gallbladder_disease: currentRecord.gallbladder_disease ?? 0,
        pancreatitis: currentRecord.pancreatitis ?? 0,
        liver_disease: currentRecord.liver_disease ?? 0,
        upper_gastrointestinal_bleeding:
          currentRecord.upper_gastrointestinal_bleeding ?? 0,
        gastrointestinal_infection:
          currentRecord.gastrointestinal_infection ?? 0,
        lactose_intolerance: currentRecord.lactose_intolerance ?? 0,
        food_poisoning: currentRecord.food_poisoning ?? 0,
        diverticulitis: currentRecord.diverticulitis ?? 0,
        irritable_bowel_syndrome: currentRecord.irritable_bowel_syndrome ?? 0,
        constipation: currentRecord.constipation ?? 0,
        dehydration: currentRecord.dehydration ?? 0,
        hypothyroidism: currentRecord.hypothyroidism ?? 0,
        bile_duct_obstruction: currentRecord.bile_duct_obstruction ?? 0,
        malabsorption_syndrome: currentRecord.malabsorption_syndrome ?? 0,
        rapid_gastrointestinal_transit:
          currentRecord.rapid_gastrointestinal_transit ?? 0,
      };

      setFormData(initializedData);
      setHasChanges(false);
      currentRecordIdRef.current = currentRecord.id;

      // Scroll to top when changing records
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [currentRecord]);

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const handleInputChange = (field: keyof PoopRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Fire and forget save - don't wait for response
  const saveInBackground = useCallback(() => {
    if (!currentRecordIdRef.current || !hasChanges) return;

    // Fire the request and don't wait
    updateRecord(currentRecordIdRef.current, formData).catch((err) => {
      console.error("Background save failed:", err);
    });

    setHasChanges(false);
  }, [hasChanges, formData, updateRecord]);

  const goToNext = useCallback(() => {
    if (currentIndex < records.length - 1) {
      // Save current changes in background
      if (hasChanges) {
        saveInBackground();
      }
      // Immediately move to next
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, records.length, hasChanges, saveInBackground]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Save current changes in background
      if (hasChanges) {
        saveInBackground();
      }
      // Immediately move to previous
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex, hasChanges, saveInBackground]);

  const handleClose = useCallback(() => {
    // Save before closing if there are changes
    if (hasChanges) {
      saveInBackground();
    }
    onUpdate();
    onClose();
  }, [hasChanges, saveInBackground, onUpdate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [open, goToNext, goToPrevious, handleClose]);

  if (!open || !currentRecord) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "background.default",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Photo {currentIndex + 1} / {records.length}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            startIcon={<NavigateBefore />}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={goToNext}
            disabled={currentIndex === records.length - 1}
            endIcon={<NavigateNext />}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Main content - scrollable */}
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          overflowY: "scroll",
          overflowX: "hidden",
          position: "relative",
          height: 0, // Forces flex child to respect flex parent height
        }}
      >
        {/* Image */}
        {formData.s3_url && (
          <Box
            sx={{
              width: "100%",
              minHeight: isMobile ? "300px" : "400px",
              maxHeight: isMobile ? "40vh" : "50vh",
              bgcolor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={formData.s3_url}
              alt="Record"
              sx={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* Form */}
        <Box sx={{ p: 3, pb: 16, minHeight: "100vh" }}>
          {/* ML Training Flag */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              ML Training
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Good for ML?</InputLabel>
              <Select
                value={
                  formData.image_good_for_ml === null
                    ? ""
                    : formData.image_good_for_ml
                    ? "true"
                    : "false"
                }
                label="Good for ML?"
                onChange={(e) => {
                  const value = e.target.value;
                  let newValue: boolean | null = null;
                  if (value === "true") newValue = true;
                  else if (value === "false") newValue = false;
                  handleInputChange("image_good_for_ml", newValue);
                }}
              >
                <MenuItem value="">Not Set</MenuItem>
                <MenuItem value="true">✅ Yes</MenuItem>
                <MenuItem value="false">❌ No</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Bristol Type</InputLabel>
                <Select
                  value={formData.bristol_type ?? ""}
                  label="Bristol Type"
                  onChange={(e) =>
                    handleInputChange("bristol_type", Number(e.target.value))
                  }
                >
                  {Object.entries(BRISTOL_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {value}: {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Consistency</InputLabel>
                <Select
                  value={formData.consistency ?? ""}
                  label="Consistency"
                  onChange={(e) =>
                    handleInputChange("consistency", Number(e.target.value))
                  }
                >
                  {Object.entries(CONSISTENCY_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Shape</InputLabel>
                <Select
                  value={formData.shape ?? ""}
                  label="Shape"
                  onChange={(e) =>
                    handleInputChange("shape", Number(e.target.value))
                  }
                >
                  {Object.entries(SHAPE_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quantity</InputLabel>
                <Select
                  value={formData.quantity ?? ""}
                  label="Quantity"
                  onChange={(e) =>
                    handleInputChange("quantity", Number(e.target.value))
                  }
                >
                  {Object.entries(QUANTITY_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.color ?? ""}
                  label="Color"
                  onChange={(e) =>
                    handleInputChange("color", Number(e.target.value))
                  }
                >
                  {Object.entries(COLOR_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Health</InputLabel>
                <Select
                  value={formData.health ?? ""}
                  label="Health"
                  onChange={(e) =>
                    handleInputChange("health", Number(e.target.value))
                  }
                >
                  {Object.entries(HEALTH_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Details */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood</InputLabel>
                <Select
                  value={formData.blood ?? ""}
                  label="Blood"
                  onChange={(e) =>
                    handleInputChange("blood", Number(e.target.value))
                  }
                >
                  {Object.entries(BLOOD_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Mucus</InputLabel>
                <Select
                  value={formData.mucus ?? ""}
                  label="Mucus"
                  onChange={(e) =>
                    handleInputChange("mucus", Number(e.target.value))
                  }
                >
                  {Object.entries(MUCUS_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Floating</InputLabel>
                <Select
                  value={formData.floating ?? ""}
                  label="Floating"
                  onChange={(e) =>
                    handleInputChange("floating", Number(e.target.value))
                  }
                >
                  {Object.entries(FLOATING_TYPES).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Medical Conditions */}
            <Grid item xs={12} sx={{ mt: 2, mb: 4 }}>
              <Accordion disableGutters>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Medical Conditions (Optional)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ maxHeight: "none" }}>
                  <Grid container spacing={2}>
                    {CONDITIONS_FEATURES.map((condition) => (
                      <Grid item xs={12} sm={6} key={condition}>
                        <FormControl fullWidth size="small">
                          <InputLabel>
                            {condition
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </InputLabel>
                          <Select
                            value={
                              formData[condition as keyof PoopRecord] ?? ""
                            }
                            label={condition
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            onChange={(e) =>
                              handleInputChange(
                                condition as keyof PoopRecord,
                                Number(e.target.value)
                              )
                            }
                          >
                            {Object.entries(CONDITIONS_TYPES).map(
                              ([value, label]) => (
                                <MenuItem key={value} value={value}>
                                  {label}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default FastPhotoEditor;
