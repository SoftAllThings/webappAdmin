import React from "react";
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material";
import {
  CheckCircleOutline as CheckIcon,
  RadioButtonChecked as SelectedIcon,
  RadioButtonUnchecked as UnselectedIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import { SourceDef, SourceKey } from "../../services/api.dataSamples";

interface Props {
  sources: SourceDef[];
  value: SourceKey;
  onChange: (source: SourceKey) => void;
}

const SourcePicker: React.FC<Props> = ({ sources, value, onChange }) => (
  <Box
    sx={{
      display: "grid",
      gap: 1.5,
      gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
    }}
  >
    {sources.map((s) => {
      const selected = s.key === value;
      return (
        <Card
          key={s.key}
          sx={selected ? { borderColor: "primary.main", boxShadow: "0 0 0 1px #9BF0FF" } : {}}
        >
          <CardActionArea onClick={() => onChange(s.key)} sx={{ height: "100%", alignItems: "flex-start" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                {selected ? (
                  <SelectedIcon fontSize="small" color="primary" />
                ) : (
                  <UnselectedIcon fontSize="small" sx={{ color: "text.secondary" }} />
                )}
                <Typography variant="subtitle1" fontWeight={700}>
                  {s.title}
                </Typography>
              </Stack>
              <Chip
                size="small"
                variant="outlined"
                label={s.table}
                sx={{ fontFamily: "monospace", mb: 1 }}
              />
              <Typography variant="body2" sx={{ mb: 1 }}>
                {s.tagline}
              </Typography>
              <Stack spacing={0.5}>
                {s.highlights.map((h) => (
                  <Stack key={h} direction="row" spacing={0.75} alignItems="flex-start">
                    <CheckIcon sx={{ fontSize: 16, mt: "2px", color: "success.main" }} />
                    <Typography variant="caption" color="text.secondary">
                      {h}
                    </Typography>
                  </Stack>
                ))}
                {s.warnings.map((w) => (
                  <Stack key={w} direction="row" spacing={0.75} alignItems="flex-start">
                    <WarningIcon sx={{ fontSize: 16, mt: "2px", color: "warning.main" }} />
                    <Typography variant="caption" color="text.secondary">
                      {w}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    })}
  </Box>
);

export default SourcePicker;
