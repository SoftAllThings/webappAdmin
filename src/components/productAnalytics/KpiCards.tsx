import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { Kpis } from "../../services/api.bq";

type Props = { data: Kpis | null; loading: boolean };

const TILES: {
  key: keyof Kpis;
  label: string;
  sublabel: string;
  description: string;
}[] = [
  {
    key: "dau",
    label: "Active users",
    sublabel: "Unique users in range",
    description:
      "Unique users (by anonymous Firebase pseudo-ID) who fired at least one tracked event during the selected date range. Good proxy for engagement.",
  },
  {
    key: "signups",
    label: "Signups",
    sublabel: "New accounts created",
    description:
      "Users who completed signup (`pc_auth_signup_completed`). Counts unique new accounts, not attempts.",
  },
  {
    key: "scansCompleted",
    label: "Scans completed",
    sublabel: "Successful AI analyses",
    description:
      "Total number of scans where the AI analysis finished successfully (`pc_scan_analysis_completed`). This is the core value-delivery event.",
  },
  {
    key: "ahaUsers",
    label: "Aha users",
    sublabel: "First-ever scan",
    description:
      "Users who completed their VERY FIRST scan (`pc_scan_first_completed`). Activation moment — strongest predictor of retention. Watch the ratio vs signups as your key onboarding funnel health metric.",
  },
  {
    key: "purchases",
    label: "Purchases",
    sublabel: "Subscriptions bought",
    description:
      "Count of successful subscription purchases confirmed by RevenueCat (`pc_pw_purchase_completed`). Includes monthly + annual.",
  },
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
        <CardContent sx={{ textAlign: "center", py: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {t.label.toUpperCase()}
            </Typography>
            <Tooltip title={t.description} arrow placement="top">
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "text.secondary", cursor: "help" }}
              />
            </Tooltip>
          </Box>
          <Typography variant="h4" fontWeight={600} sx={{ mt: 1 }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              (data?.[t.key] ?? 0).toLocaleString()
            )}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            {t.sublabel}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export default KpiCards;
