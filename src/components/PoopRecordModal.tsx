import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import { ExpandMore, Close } from "@mui/icons-material";
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

interface PoopRecordModalProps {
  open: boolean;
  record: PoopRecord | null;
  onClose: () => void;
  onUpdate: () => void;
}

const PoopRecordModal: React.FC<PoopRecordModalProps> = ({
  open,
  record,
  onClose,
  onUpdate,
}) => {
  const { updateRecord, loading, error, clearError } = usePoopCrud();
  const [formData, setFormData] = useState<Partial<PoopRecord>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      // Ensure all numeric fields have proper values (0 if undefined/null)
      const initializedData = {
        ...record,
        bristol_type: record.bristol_type ?? 1,
        consistency: record.consistency ?? 0,
        shape: record.shape ?? 0,
        quantity: record.quantity ?? 0,
        color: record.color ?? 0,
        health: record.health ?? 0,
        blood: record.blood ?? 0,
        mucus: record.mucus ?? 0,
        floating: record.floating ?? 0,
        smell_level: record.smell_level ?? 0,
        pain_level: record.pain_level ?? 0,
        duration: record.duration ?? 0,
        verified: record.verified ?? false,
        // Initialize all condition fields
        liver_flukes: record.liver_flukes ?? 0,
        colon_cancer: record.colon_cancer ?? 0,
        hemorrhoids: record.hemorrhoids ?? 0,
        anal_fissures: record.anal_fissures ?? 0,
        crohns_disease: record.crohns_disease ?? 0,
        ulcerative_colitis: record.ulcerative_colitis ?? 0,
        celiac_disease: record.celiac_disease ?? 0,
        gallbladder_disease: record.gallbladder_disease ?? 0,
        pancreatitis: record.pancreatitis ?? 0,
        liver_disease: record.liver_disease ?? 0,
        upper_gastrointestinal_bleeding:
          record.upper_gastrointestinal_bleeding ?? 0,
        gastrointestinal_infection: record.gastrointestinal_infection ?? 0,
        lactose_intolerance: record.lactose_intolerance ?? 0,
        food_poisoning: record.food_poisoning ?? 0,
        diverticulitis: record.diverticulitis ?? 0,
        irritable_bowel_syndrome: record.irritable_bowel_syndrome ?? 0,
        constipation: record.constipation ?? 0,
        dehydration: record.dehydration ?? 0,
        hypothyroidism: record.hypothyroidism ?? 0,
        bile_duct_obstruction: record.bile_duct_obstruction ?? 0,
        malabsorption_syndrome: record.malabsorption_syndrome ?? 0,
        rapid_gastrointestinal_transit:
          record.rapid_gastrointestinal_transit ?? 0,
      };

      setFormData(initializedData);
      console.log("🔍 Modal: Initialized form data:", initializedData);
      setHasChanges(false);
    }
  }, [record]);

  // Clear error when modal opens
  useEffect(() => {
    if (open) {
      clearError();
    }
  }, [open, clearError]);

  const handleInputChange = (field: keyof PoopRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    if (!record?.id || !hasChanges) return;

    try {
      await updateRecord(record.id, formData);
      onUpdate();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setHasChanges(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Edit Poop Record</Typography>
        {isMobile && (
          <Button onClick={handleClose} size="small">
            <Close />
          </Button>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Image at the top */}
        {formData.s3_url && (
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="subtitle2" gutterBottom>
              Image:
            </Typography>
            <Box
              component="img"
              src={formData.s3_url}
              alt="Poop record"
              sx={{
                width: "100%",
                maxWidth: 400,
                maxHeight: 300,
                objectFit: "contain",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Bristol Type */}
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

          {/* Consistency */}
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

          {/* Shape */}
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

          {/* Quantity */}
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

          {/* Color */}
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

          {/* Health */}
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
          <Grid item xs={12}>
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{ mt: 2 }}
            >
              Additional Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {/* Blood */}
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

          {/* Mucus */}
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

          {/* Floating */}
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

          {/* Numeric Fields */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Smell Level (0-10)"
              type="number"
              inputProps={{ min: 0, max: 10 }}
              value={formData.smell_level ?? ""}
              onChange={(e) =>
                handleInputChange("smell_level", Number(e.target.value))
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pain Level (0-10)"
              type="number"
              inputProps={{ min: 0, max: 10 }}
              value={formData.pain_level ?? ""}
              onChange={(e) =>
                handleInputChange("pain_level", Number(e.target.value))
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              inputProps={{ min: 0 }}
              value={formData.duration ?? ""}
              onChange={(e) =>
                handleInputChange("duration", Number(e.target.value))
              }
            />
          </Grid>

          {/* Verified Switch */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.verified || false}
                  onChange={(e) =>
                    handleInputChange("verified", e.target.checked)
                  }
                />
              }
              label="Verified"
            />
          </Grid>

          {/* Medical Conditions */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" color="primary">
                  Medical Conditions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {CONDITIONS_FEATURES.map((condition) => (
                    <Grid item xs={12} sm={6} md={4} key={condition}>
                      <FormControl fullWidth size="small">
                        <InputLabel>
                          {condition
                            .replace(/_/g, " ")
                            .replace(/\\b\\w/g, (l) => l.toUpperCase())}
                        </InputLabel>
                        <Select
                          value={formData[condition as keyof PoopRecord] ?? ""}
                          label={condition
                            .replace(/_/g, " ")
                            .replace(/\\b\\w/g, (l) => l.toUpperCase())}
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !hasChanges}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoopRecordModal;
