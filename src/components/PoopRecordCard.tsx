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
  useTheme,
  useMediaQuery,
  Stack,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  console.log("🃏 Card: Rendering record:", record);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getHealthColor = (health: number) => {
    return health === 0 ? "success" : "warning";
  };

  const getSeverityColor = (level: number, maxLevel: number = 3) => {
    if (level === 0) return "success";
    if (level === 1) return "warning";
    if (level >= 2) return "error";
    return "default";
  };

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              elevation: 8,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            }
          : undefined,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClick}
    >
      {record.s3_url && (
        <CardMedia
          component="img"
          height={isMobile ? "150" : "200"}
          image={record.s3_url}
          alt={`Poop record ${record.id}`}
          sx={{ objectFit: "contain" }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, p: isMobile ? 1.5 : 2 }}>
        {/* Header with date and verification */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant={isMobile ? "body2" : "body1"}
              color="text.secondary"
            >
              {formatDate(record.created_at)}
            </Typography>
          </Stack>
          {!isMobile && (
            <Typography variant="caption" color="text.secondary">
              {formatTime(record.created_at)}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Primary Information */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={`Bristol ${record.bristol_type}: ${getBristolLabel(
              record.bristol_type
            )}`}
            color="primary"
            size={isMobile ? "small" : "medium"}
            sx={{
              fontSize: isMobile ? "0.7rem" : "0.8rem",
              height: isMobile ? 24 : 32,
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={getConsistencyLabel(record.consistency)}
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.7rem" }}
            />
            <Chip
              label={getColorLabel(record.color)}
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.7rem" }}
            />
            <Chip
              label={getQuantityLabel(record.quantity)}
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.7rem" }}
            />
          </Stack>
        </Stack>

        {/* Health and Alerts */}
        <Stack spacing={1}>
          <Chip
            label={`Health: ${getHealthLabel(record.health)}`}
            color={getHealthColor(record.health) as any}
            size="small"
            sx={{ fontSize: "0.7rem" }}
          />

          {/* Show blood/mucus if present */}
          {(record.blood > 0 || record.mucus > 0) && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {record.blood > 0 && (
                <Chip
                  label={`Blood: ${getBloodLabel(record.blood)}`}
                  color={getSeverityColor(record.blood) as any}
                  size="small"
                  sx={{ fontSize: "0.65rem" }}
                />
              )}
              {record.mucus > 0 && (
                <Chip
                  label={`Mucus: ${getMucusLabel(record.mucus)}`}
                  color={getSeverityColor(record.mucus) as any}
                  size="small"
                  sx={{ fontSize: "0.65rem" }}
                />
              )}
            </Stack>
          )}

          {/* Additional details in mobile compact view */}
          {!isMobile && (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Shape: {getShapeLabel(record.shape)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  {getFloatingLabel(record.floating)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PoopRecordCard;
