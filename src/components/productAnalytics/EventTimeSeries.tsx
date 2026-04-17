import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { bqApi, EventSeriesPoint } from "../../services/api.bq";

type Props = { from: string; to: string };

const EventTimeSeries: React.FC<Props> = ({ from, to }) => {
  const [events, setEvents] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("pc_scan_analysis_completed");
  const [data, setData] = useState<EventSeriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bqApi
      .fetchEventList()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!from || !to || !selected) return;
    setLoading(true);
    setError(null);
    bqApi
      .fetchEventTimeseries(selected, from, to)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected, from, to]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6">Event time-series</Typography>
        <Select
          size="small"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          sx={{ minWidth: 260 }}
        >
          {events.map((ev) => (
            <MenuItem key={ev} value={ev}>
              {ev}
            </MenuItem>
          ))}
        </Select>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#6366f1" name="Events" />
              <Line type="monotone" dataKey="uniqueUsers" stroke="#8b5cf6" name="Unique users" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default EventTimeSeries;
