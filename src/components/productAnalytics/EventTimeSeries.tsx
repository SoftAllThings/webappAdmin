import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  Select,
  ListSubheader,
  CircularProgress,
  InputLabel,
  FormControl,
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
import {
  CATEGORY_ORDER,
  getEventLabel,
  getEventDescription,
  getEventCategory,
  EventCategory,
} from "./eventsMetadata";

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

  const grouped = useMemo(() => {
    const map = new Map<EventCategory | "Other", string[]>();
    for (const ev of events) {
      const cat = getEventCategory(ev);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(ev);
    }
    return [...CATEGORY_ORDER, "Other" as const]
      .filter((c) => map.has(c))
      .map((cat) => ({ category: cat, events: map.get(cat)! }));
  }, [events]);

  const description = getEventDescription(selected);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Event time-series</Typography>
        <Typography variant="body2" color="text.secondary">
          Daily volume of a single event. Pick any tracked event to see how often
          it fires and how many unique users trigger it.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 320 }}>
          <InputLabel id="event-picker-label">Event</InputLabel>
          <Select
            labelId="event-picker-label"
            label="Event"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            renderValue={(val) => getEventLabel(val as string)}
          >
            {grouped.flatMap(({ category, events: evs }) => [
              <ListSubheader key={`h-${category}`}>{category}</ListSubheader>,
              ...evs.map((ev) => (
                <MenuItem key={ev} value={ev}>
                  <Box>
                    <Typography variant="body2">{getEventLabel(ev)}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {ev}
                    </Typography>
                  </Box>
                </MenuItem>
              )),
            ])}
          </Select>
        </FormControl>
      </Box>

      {description && (
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
            <strong style={{ color: "rgba(0,0,0,0.87)" }}>
              {getEventLabel(selected)}:
            </strong>{" "}
            {description}{" "}
            <Typography
              component="span"
              variant="caption"
              sx={{ fontFamily: "monospace", color: "text.disabled" }}
            >
              ({selected})
            </Typography>
          </Typography>
        </Box>
      )}

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
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                name="Total events"
              />
              <Line
                type="monotone"
                dataKey="uniqueUsers"
                stroke="#8b5cf6"
                name="Unique users"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default EventTimeSeries;
