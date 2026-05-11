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
import {
  bqApi,
  EventSeriesPoint,
  EventBreakdownPoint,
} from "../../services/api.bq";
import {
  CATEGORY_ORDER,
  getEventLabel,
  getEventDescription,
  getEventCategory,
  getEventBreakdownParams,
  EventCategory,
} from "./eventsMetadata";

// Stable, colour-blind-friendly palette for breakdown series.
const SERIES_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange
  "#0ea5e9", // sky
  "#a3a3a3", // grey — reserved for "Other"
];

type Props = { from: string; to: string };

type WidePoint = { date: string; [key: string]: string | number };

function pivotBreakdown(rows: EventBreakdownPoint[]): {
  data: WidePoint[];
  series: string[];
} {
  const dateMap = new Map<string, WidePoint>();
  const totals = new Map<string, number>();

  for (const r of rows) {
    totals.set(r.value, (totals.get(r.value) ?? 0) + r.count);
    let row = dateMap.get(r.date);
    if (!row) {
      row = { date: r.date };
      dateMap.set(r.date, row);
    }
    const prev = typeof row[r.value] === "number" ? (row[r.value] as number) : 0;
    row[r.value] = prev + r.count;
  }

  // Order series by total volume descending so the legend matches eye-order.
  const series: string[] = [];
  totals.forEach((_v, k) => series.push(k));
  series.sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return (totals.get(b) ?? 0) - (totals.get(a) ?? 0);
  });

  // Zero-fill missing values so recharts draws a continuous line.
  const data: WidePoint[] = [];
  dateMap.forEach((row) => data.push(row));
  data.sort((a, b) => a.date.localeCompare(b.date));
  for (const row of data) {
    for (const s of series) {
      if (row[s] === undefined) row[s] = 0;
    }
  }
  return { data, series };
}

const OTHER_COLOR = "#a3a3a3";

function colorFor(seriesName: string, index: number): string {
  if (seriesName === "Other") return OTHER_COLOR;
  const pool = SERIES_COLORS.length - 1; // last slot reserved for "Other"
  return SERIES_COLORS[index % pool] ?? OTHER_COLOR;
}

const EventTimeSeries: React.FC<Props> = ({ from, to }) => {
  const [events, setEvents] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("pc_scan_analysis_completed");
  const [breakdown, setBreakdown] = useState<string>("");
  const [aggregate, setAggregate] = useState<EventSeriesPoint[]>([]);
  const [broken, setBroken] = useState<EventBreakdownPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bqApi
      .fetchEventList()
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, []);

  // Reset the breakdown picker when the event changes — params don't carry across.
  useEffect(() => {
    setBreakdown("");
  }, [selected]);

  useEffect(() => {
    if (!from || !to || !selected) return;
    setLoading(true);
    setError(null);
    const promise = breakdown
      ? bqApi
          .fetchEventBreakdownTimeseries(selected, from, to, breakdown)
          .then((rows) => {
            setBroken(rows);
            setAggregate([]);
          })
      : bqApi.fetchEventTimeseries(selected, from, to).then((rows) => {
          setAggregate(rows);
          setBroken([]);
        });
    promise
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selected, from, to, breakdown]);

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
  const breakdownParams = getEventBreakdownParams(selected);
  const { data: brokenWide, series: brokenSeries } = useMemo(
    () => pivotBreakdown(broken),
    [broken]
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Event time-series</Typography>
        <Typography variant="body2" color="text.secondary">
          Daily volume of a single event. Pick any tracked event to see how often
          it fires and how many unique users trigger it. Some events carry
          dimensions (card type, plan, error code…) — pick a breakdown to split
          the chart by that dimension.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 320 } }}>
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

        {breakdownParams.length > 0 && (
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 240 } }}>
            <InputLabel id="breakdown-picker-label">Breakdown by</InputLabel>
            <Select
              labelId="breakdown-picker-label"
              label="Breakdown by"
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value)}
            >
              <MenuItem value="">
                <em>None (totals only)</em>
              </MenuItem>
              {breakdownParams.map((p) => (
                <MenuItem key={p.key} value={p.key}>
                  <Box>
                    <Typography variant="body2">{p.label}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {p.key}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
      ) : breakdown ? (
        <Box sx={{ width: "100%", height: 360 }}>
          {brokenSeries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No data for this event + breakdown in the selected range.
            </Typography>
          ) : (
            <ResponsiveContainer>
              <LineChart data={brokenWide}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {brokenSeries.map((s, i) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey={s}
                    stroke={colorFor(s, i)}
                    name={s}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={aggregate}>
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
