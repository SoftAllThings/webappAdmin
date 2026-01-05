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
import { PoopRecord } from "../../types/poop";
import {
  getBristolLabel,
  getConsistencyLabel,
  getShapeLabel,
  getColorLabel,
  getQuantityLabel,
  getHealthLabel,
  getMucusLabel,
  getBloodLabel,
  getFloatingLabel,
  getHealthColor,
  getSeverityColor,
  formatDate,
  formatTime,
} from "../../utils/labelHelpers";

interface PoopRecordCardProps {
  record: PoopRecord;
  onClick?: () => void;
}

const PoopRecordCard: React.FC<PoopRecordCardProps> = ({ record, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  console.log("🃏 Card: Rendering record:", record);

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              boxShadow: 8,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            }
          : undefined,
        "&:active": onClick
          ? {
              transform: "scale(0.98)",
              transition: "all 0.1s ease-in-out",
            }
          : undefined,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: 2,
        borderRadius: 2,
      }}
      onClick={onClick}
    >
      {record.s3_url && (
        <CardMedia
          component="img"
          height={isMobile ? "200" : "250"}
          image={record.s3_url}
          alt={`Poop record ${record.id}`}
          sx={{
            objectFit: "contain",
            bgcolor: "grey.100",
          }}
        />
      )}

      {/* ML Training Indicator */}
      {record.image_good_for_ml !== null && (
        <Chip
          label={record.image_good_for_ml ? "✅ ML Ready" : "❌ Not for ML"}
          size="small"
          color={record.image_good_for_ml ? "success" : "default"}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: "0.65rem",
            height: 20,
          }}
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
