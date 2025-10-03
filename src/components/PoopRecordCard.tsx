import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Grid,
  Divider,
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

interface PoopRecordCardProps {
  record: PoopRecord;
  onClick?: () => void;
}

const PoopRecordCard: React.FC<PoopRecordCardProps> = ({ record, onClick }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString();
  };

  const getBristolLabel = (type: number) => {
    return BRISTOL_TYPES[type as keyof typeof BRISTOL_TYPES] || `Type ${type}`;
  };

  const getConsistencyLabel = (consistency: number) => {
    return (
      CONSISTENCY_TYPES[consistency as keyof typeof CONSISTENCY_TYPES] ||
      `Level ${consistency}`
    );
  };

  const getShapeLabel = (shape: number) => {
    return SHAPE_TYPES[shape as keyof typeof SHAPE_TYPES] || `Shape ${shape}`;
  };

  const getColorLabel = (color: number) => {
    return COLOR_TYPES[color as keyof typeof COLOR_TYPES] || `Color ${color}`;
  };

  const getQuantityLabel = (quantity: number) => {
    return (
      QUANTITY_TYPES[quantity as keyof typeof QUANTITY_TYPES] ||
      `Quantity ${quantity}`
    );
  };

  const getHealthLabel = (health: number) => {
    return (
      HEALTH_TYPES[health as keyof typeof HEALTH_TYPES] || `Health ${health}`
    );
  };

  const getMucusLabel = (mucus: number) => {
    return MUCUS_TYPES[mucus as keyof typeof MUCUS_TYPES] || `Mucus ${mucus}`;
  };

  const getBloodLabel = (blood: number) => {
    return BLOOD_TYPES[blood as keyof typeof BLOOD_TYPES] || `Blood ${blood}`;
  };

  const getFloatingLabel = (floating: number) => {
    return (
      FLOATING_TYPES[floating as keyof typeof FLOATING_TYPES] ||
      `Floating ${floating}`
    );
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? { elevation: 8 } : undefined,
      }}
      onClick={onClick}
    >
      {record.s3_url && (
        <CardMedia
          component="img"
          height="200"
          image={record.s3_url}
          alt={`Poop record ${record.id}`}
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" gutterBottom>
            Record ID: {record.id.slice(-8)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: {formatDate(record.created_at)} at{" "}
            {formatTime(record.created_at)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Chip
              label={`Bristol Type ${record.bristol_type}: ${getBristolLabel(
                record.bristol_type
              )}`}
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Consistency:</strong>{" "}
              {getConsistencyLabel(record.consistency)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Shape:</strong> {getShapeLabel(record.shape)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Color:</strong> {getColorLabel(record.color)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Quantity:</strong> {record.quantity}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Health Indicators:</strong>
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {record.blood > 0 && (
              <Chip
                label={`Blood: ${record.blood}`}
                size="small"
                color="error"
              />
            )}
            {record.mucus > 0 && (
              <Chip
                label={`Mucus: ${record.mucus}`}
                size="small"
                color="warning"
              />
            )}
            {record.floating > 0 && (
              <Chip label="Floating" size="small" color="info" />
            )}
            {record.verified && (
              <Chip label="Verified" size="small" color="success" />
            )}
          </Box>
        </Box>

        {record.gpt_bristol_type && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>AI Analysis:</strong> {record.gpt_bristol_type}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PoopRecordCard;
