import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { bqApi, FunnelStep, FunnelType } from "../../services/api.bq";

type Props = { from: string; to: string };

const FUNNEL_DESCRIPTIONS: Record<FunnelType, { title: string; body: string }> = {
  signup: {
    title: "Signup funnel",
    body:
      "Tracks users from finishing onboarding all the way to account creation. A steep drop between 'Signup started' and 'Signup completed' usually means auth friction (form errors, Apple/Google failures).",
  },
  scan: {
    title: "Scan funnel",
    body:
      "Your core product flow: opening the camera → capturing a photo → answering lifestyle questions → getting an AI result. Drop-offs here typically surface UX friction in the scan path.",
  },
  paywall: {
    title: "Paywall / purchase funnel",
    body:
      "Users seeing the paywall → picking a plan → initiating purchase → completing payment. Drop between 'Purchase initiated' and 'Purchase completed' is usually payment sheet abandonment or RevenueCat failures.",
  },
};

const FunnelChart: React.FC<Props> = ({ from, to }) => {
  const [type, setType] = useState<FunnelType>("paywall");
  const [data, setData] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    bqApi
      .fetchFunnel(type, from, to)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, from, to]);

  const desc = FUNNEL_DESCRIPTIONS[type];
  const topUsers = data[0]?.users ?? 0;
  const bottomUsers = data[data.length - 1]?.users ?? 0;
  const overallConv =
    topUsers > 0 ? ((bottomUsers / topUsers) * 100).toFixed(1) : "0.0";

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Conversion funnels</Typography>
        <Typography variant="body2" color="text.secondary">
          Drop-off between sequential steps of a user journey. Each bar counts
          unique users. The % label shows how many dropped off between steps.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={type}
          exclusive
          onChange={(_, v) => v && setType(v)}
        >
          <ToggleButton value="signup">Signup</ToggleButton>
          <ToggleButton value="scan">Scan</ToggleButton>
          <ToggleButton value="paywall">Paywall</ToggleButton>
        </ToggleButtonGroup>

        {!loading && topUsers > 0 && (
          <Typography variant="body2" color="text.secondary">
            Top-to-bottom conversion:{" "}
            <strong style={{ color: "rgba(0,0,0,0.87)" }}>{overallConv}%</strong>
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          p: 1.5,
          mb: 2,
          bgcolor: "grey.50",
          border: 1,
          borderColor: "grey.200",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong style={{ color: "rgba(0,0,0,0.87)" }}>{desc.title}:</strong>{" "}
          {desc.body}
        </Typography>
      </Box>

      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 60 + data.length * 70 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 60, right: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="step" type="category" width={160} />
              <Tooltip
                formatter={(v: any, key: any) => {
                  const num = Number(v);
                  return key === "users"
                    ? [num.toLocaleString(), "Users"]
                    : [num, "Drop-off %"];
                }}
              />
              <Bar dataKey="users" fill="#6366f1">
                <LabelList
                  dataKey="users"
                  position="right"
                  formatter={(v: any) =>
                    typeof v === "number" ? v.toLocaleString() : v
                  }
                />
                <LabelList
                  dataKey="dropOffPct"
                  position="insideRight"
                  formatter={(v: any) =>
                    typeof v === "number" && v > 0 ? `-${v}%` : ""
                  }
                  fill="#fff"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default FunnelChart;
