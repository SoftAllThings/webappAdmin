import React from "react";
import { Box, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import type { Kpis } from "../../services/api.bq";

type Props = { data: Kpis | null; loading: boolean };

const TILES: { key: keyof Kpis; label: string }[] = [
  { key: "dau", label: "Active users" },
  { key: "signups", label: "Signups" },
  { key: "scansCompleted", label: "Scans completed" },
  { key: "ahaUsers", label: "First-scan users (aha)" },
  { key: "purchases", label: "Purchases" },
];

const KpiCards: React.FC<Props> = ({ data, loading }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(2, 1fr)",
        sm: "repeat(3, 1fr)",
        md: "repeat(5, 1fr)",
      },
      gap: 2,
      mb: 4,
    }}
  >
    {TILES.map((t) => (
      <Card key={t.key} elevation={2}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {t.label}
          </Typography>
          <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={24} /> : (data?.[t.key] ?? 0).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export default KpiCards;
