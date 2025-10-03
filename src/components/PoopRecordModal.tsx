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
} from "@mui/material";
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

  // Initialize form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      setHasChanges(false);
    } else {
      setFormData({});
      setHasChanges(false);
    }
    clearError();
  }, [record, clearError]);

  const handleInputChange = (field: keyof PoopRecord, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!record || !hasChanges) return;

    const result = await updateRecord(record.id, formData);
    if (result) {
      onUpdate();
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) return;
    }
    onClose();
  };

  if (!record) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "600px" },
      }}
    >
      <DialogTitle>
        Edit Poop Record
        <Typography variant="body2" color="text.secondary">
          ID: {record.id}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {record.s3_url && (
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <img
              src={record.s3_url}
              alt="Poop record"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Bristol Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Bristol Type</InputLabel>
              <Select
                value={formData.bristol_type || ""}
                label="Bristol Type"
                onChange={(e) =>
                  handleInputChange("bristol_type", Number(e.target.value))
                }
              >
                {Object.entries(BRISTOL_TYPES).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    Type {value}: {label}
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
                value={formData.consistency || ""}
                label="Consistency"
                onChange={(e) =>
                  handleInputChange("consistency", Number(e.target.value))
                }
              >
                {Object.entries(CONSISTENCY_TYPES).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
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
                value={formData.shape || ""}
                label="Shape"
                onChange={(e) =>
                  handleInputChange("shape", Number(e.target.value))
                }
              >
                {Object.entries(SHAPE_TYPES).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
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
                value={formData.color || ""}
                label="Color"
                onChange={(e) =>
                  handleInputChange("color", Number(e.target.value))
                }
              >
                {Object.entries(COLOR_TYPES).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity || ""}
              onChange={(e) =>
                handleInputChange("quantity", Number(e.target.value))
              }
              inputProps={{ min: 0, max: 10 }}
            />
          </Grid>

          {/* Health */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Health Level"
              type="number"
              value={formData.health || ""}
              onChange={(e) =>
                handleInputChange("health", Number(e.target.value))
              }
              inputProps={{ min: 0, max: 10 }}
            />
          </Grid>

          {/* Blood */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Blood Level"
              type="number"
              value={formData.blood || ""}
              onChange={(e) =>
                handleInputChange("blood", Number(e.target.value))
              }
              inputProps={{ min: 0, max: 10 }}
            />
          </Grid>

          {/* Mucus */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Mucus Level"
              type="number"
              value={formData.mucus || ""}
              onChange={(e) =>
                handleInputChange("mucus", Number(e.target.value))
              }
              inputProps={{ min: 0, max: 10 }}
            />
          </Grid>

          {/* Verified */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.verified || false}
                  onChange={(e) =>
                    handleInputChange("verified", e.target.checked)
                  }
                />
              }
              label="Verified Record"
            />
          </Grid>

          {/* GPT Bristol Type */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="AI Analysis (GPT Bristol Type)"
              multiline
              rows={2}
              value={formData.gpt_bristol_type || ""}
              onChange={(e) =>
                handleInputChange("gpt_bristol_type", e.target.value)
              }
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !hasChanges}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PoopRecordModal;
