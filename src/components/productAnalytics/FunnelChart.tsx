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

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6">Conversion funnel</Typography>
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
                  formatter={(v: any) => (typeof v === "number" ? v.toLocaleString() : v)}
                />
                <LabelList
                  dataKey="dropOffPct"
                  position="insideRight"
                  formatter={(v: any) => (typeof v === "number" && v > 0 ? `-${v}%` : "")}
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
