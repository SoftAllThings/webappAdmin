import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Button, Grid, Typography, IconButton } from "@mui/material";
import { Close, NavigateBefore, NavigateNext } from "@mui/icons-material";
import {
  PoopRecord,
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
import ToggleButtonField from "./ToggleButtonField";

// ML Training options
const ML_TRAINING_OPTIONS = {
  "": "Not Set",
  true: "✅ Yes",
  false: "❌ No",
};

// Simplified Bristol Type labels for toggle buttons
const BRISTOL_TYPES_SHORT = {
  1: "Type 1",
  2: "Type 2",
  3: "Type 3",
  4: "Type 4",
  5: "Type 5",
  6: "Type 6",
  7: "Type 7",
} as const;

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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            {currentIndex + 1} / {records.length}
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
          height: "calc(100vh - 73px)",
          overflowY: "auto",
        }}
      >
        {/* Image */}
        {formData.s3_url && (
          <Box
            sx={{
              width: "100%",
              height: "300px",
              bgcolor: "black",
            }}
          >
            <img
              src={formData.s3_url}
              alt="Record"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        )}

        {/* Form */}
        <Box sx={{ p: 3, pb: 20 }}>
          {/* ML Training Flag */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{ mb: 2 }}
            >
              ML Training
            </Typography>
            <ToggleButtonField
              label="Is this image good for ML training?"
              value={
                formData.image_good_for_ml === null
                  ? ""
                  : formData.image_good_for_ml
                  ? "true"
                  : "false"
              }
              options={ML_TRAINING_OPTIONS}
              onChange={(value) => {
                const strValue = value.toString();
                let newValue: boolean | null = null;
                if (strValue === "true") newValue = true;
                else if (strValue === "false") newValue = false;
                handleInputChange("image_good_for_ml", newValue);
              }}
              fullWidth
            />
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Bristol Type"
                value={formData.bristol_type}
                options={BRISTOL_TYPES_SHORT}
                onChange={(value) =>
                  handleInputChange("bristol_type", Number(value))
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Consistency"
                value={formData.consistency}
                options={CONSISTENCY_TYPES}
                onChange={(value) =>
                  handleInputChange("consistency", Number(value))
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Shape"
                value={formData.shape}
                options={SHAPE_TYPES}
                onChange={(value) => handleInputChange("shape", Number(value))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Quantity"
                value={formData.quantity}
                options={QUANTITY_TYPES}
                onChange={(value) =>
                  handleInputChange("quantity", Number(value))
                }
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Color"
                value={formData.color}
                options={COLOR_TYPES}
                onChange={(value) => handleInputChange("color", Number(value))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Health"
                value={formData.health}
                options={HEALTH_TYPES}
                onChange={(value) => handleInputChange("health", Number(value))}
                fullWidth
              />
            </Grid>

            {/* Additional Details */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Details
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Blood"
                value={formData.blood}
                options={BLOOD_TYPES}
                onChange={(value) => handleInputChange("blood", Number(value))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Mucus"
                value={formData.mucus}
                options={MUCUS_TYPES}
                onChange={(value) => handleInputChange("mucus", Number(value))}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <ToggleButtonField
                label="Floating"
                value={formData.floating}
                options={FLOATING_TYPES}
                onChange={(value) =>
                  handleInputChange("floating", Number(value))
                }
                fullWidth
              />
            </Grid>

            {/* Medical Conditions */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Medical Conditions
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                {CONDITIONS_FEATURES.map((condition) => (
                  <Grid item xs={12} key={condition}>
                    <ToggleButtonField
                      label={condition
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      value={
                        formData[condition as keyof PoopRecord] as
                          | number
                          | undefined
                      }
                      options={CONDITIONS_TYPES}
                      onChange={(value) =>
                        handleInputChange(
                          condition as keyof PoopRecord,
                          Number(value)
                        )
                      }
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default FastPhotoEditor;
