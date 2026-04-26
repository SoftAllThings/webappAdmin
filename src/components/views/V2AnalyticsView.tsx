import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  v2AnalyticsApi,
  AggregateRow,
  IndividualRow,
  StoolLogRow,
  StoolLogStats,
  V2Overview,
  IndividualsFilterParams,
  StoolLogsFilterParams,
} from "../../services/api.v2Analytics";

const PIE_COLORS = [
  "#1976d2",
  "#dc004e",
  "#2e7d32",
  "#ed6c02",
  "#9c27b0",
  "#0288d1",
  "#d32f2f",
  "#5d4037",
  "#00796b",
  "#7b1fa2",
];

// ---------- Overview ----------

const OverviewCards: React.FC<{ overview: V2Overview | null; loading: boolean }> = ({
  overview,
  loading,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (!overview) return null;
  const items = [
    { label: "Individuals", value: overview.individuals.toLocaleString() },
    { label: "Stool logs", value: overview.stoolLogs.toLocaleString() },
    { label: "Organizations", value: overview.organizations.toLocaleString() },
    {
      label: "Latest stool log",
      value: overview.latestStoolLogAt
        ? new Date(overview.latestStoolLogAt).toLocaleString()
        : "—",
    },
  ];
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {items.map((it) => (
        <Grid key={it.label} item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {it.label}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {it.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// ---------- Individuals Panel ----------

const INDIVIDUAL_GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: "sex", label: "Sex" },
  { value: "diet", label: "Diet" },
  { value: "age_bucket", label: "Age bucket" },
  { value: "stressLevel", label: "Stress level" },
  { value: "physicalActivityLevel", label: "Physical activity level" },
  { value: "waterIntake", label: "Water intake" },
  { value: "alcoholConsumption", label: "Alcohol consumption" },
  { value: "organization_id", label: "Organization" },
];

const IndividualsPanel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filters, setFilters] = useState<IndividualsFilterParams>({
    page: 1,
    limit: 25,
  });
  const [rows, setRows] = useState<IndividualRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groupBy, setGroupBy] = useState("sex");
  const [agg, setAgg] = useState<AggregateRow[]>([]);
  const [aggLoading, setAggLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await v2AnalyticsApi.listIndividuals(filters);
      setRows(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAggregate = useCallback(async () => {
    setAggLoading(true);
    try {
      const res = await v2AnalyticsApi.individualsAggregate(groupBy, filters);
      setAgg(res.data);
    } catch (e) {
      console.error("individuals aggregate error", e);
    } finally {
      setAggLoading(false);
    }
  }, [groupBy, filters]);

  useEffect(() => {
    fetchData();
    fetchAggregate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (
    key: keyof IndividualsFilterParams,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchData();
    fetchAggregate();
  };

  const handleReset = () => {
    const cleared: IndividualsFilterParams = { page: 1, limit: 25 };
    setFilters(cleared);
    setTimeout(() => {
      setFilters(cleared);
      fetchData();
      fetchAggregate();
    }, 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? 25)));

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters — individuals
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sex"
                value={filters.sex ?? ""}
                onChange={(e) => updateFilter("sex", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Diet"
                value={filters.diet ?? ""}
                onChange={(e) => updateFilter("diet", e.target.value || undefined)}
                placeholder="vegan, omnivore, ..."
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Age min"
                type="number"
                value={filters.age_min ?? ""}
                onChange={(e) => updateFilter("age_min", e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Age max"
                type="number"
                value={filters.age_max ?? ""}
                onChange={(e) => updateFilter("age_max", e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Organization ID"
                type="number"
                value={filters.organization_id ?? ""}
                onChange={(e) =>
                  updateFilter("organization_id", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Stress level"
                value={filters.stress_level ?? ""}
                onChange={(e) =>
                  updateFilter("stress_level", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Activity level"
                value={filters.physical_activity_level ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "physical_activity_level",
                    e.target.value || undefined
                  )
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Water intake"
                value={filters.water_intake ?? ""}
                onChange={(e) =>
                  updateFilter("water_intake", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Alcohol"
                value={filters.alcohol_consumption ?? ""}
                onChange={(e) =>
                  updateFilter("alcohol_consumption", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Medical condition contains"
                value={filters.medical_condition ?? ""}
                onChange={(e) =>
                  updateFilter("medical_condition", e.target.value || undefined)
                }
                placeholder="IBS, crohn, ..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Created after"
                InputLabelProps={{ shrink: true }}
                value={filters.created_after ?? ""}
                onChange={(e) =>
                  updateFilter("created_after", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Created before"
                InputLabelProps={{ shrink: true }}
                value={filters.created_before ?? ""}
                onChange={(e) =>
                  updateFilter("created_before", e.target.value || undefined)
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} mt={2}>
            <Button variant="contained" onClick={handleSearch}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6">Group individuals by</Typography>
            <TextField
              select
              size="small"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 200 } }}
            >
              {INDIVIDUAL_GROUP_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={fetchAggregate} variant="outlined" size="small">
              Refresh
            </Button>
          </Stack>
          {aggLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : agg.length === 0 ? (
            <Typography color="text.secondary">No data</Typography>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={agg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={agg}
                        dataKey="count"
                        nameKey="bucket"
                        outerRadius={isMobile ? 70 : 100}
                        label={!isMobile}
                      >
                        {agg.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length] ?? "#1976d2"}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              Individuals — {total.toLocaleString()} rows
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => {
                  setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }));
                  setTimeout(fetchData, 0);
                }}
              >
                Prev
              </Button>
              <Typography variant="body2" sx={{ alignSelf: "center" }}>
                Page {filters.page ?? 1} / {totalPages}
              </Typography>
              <Button
                size="small"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() => {
                  setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }));
                  setTimeout(fetchData, 0);
                }}
              >
                Next
              </Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <TableContainer sx={{ maxHeight: { xs: 400, md: 600 } }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>External ID</TableCell>
                    <TableCell>Org</TableCell>
                    <TableCell>Sex</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Diet</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Stress</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Activity</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Water</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Alcohol</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => {
                    const pd = r.profile_data ?? {};
                    return (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <code style={{ fontSize: 11 }}>
                            {r.external_individual_id}
                          </code>
                        </TableCell>
                        <TableCell>{r.organization_id}</TableCell>
                        <TableCell>{(pd as any).sex ?? "—"}</TableCell>
                        <TableCell>{(pd as any).age ?? "—"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{(pd as any).diet ?? "—"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{(pd as any).stressLevel ?? "—"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                          {(pd as any).physicalActivityLevel ?? "—"}
                        </TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{(pd as any).waterIntake ?? "—"}</TableCell>
                        <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                          {(pd as any).alcoholConsumption ?? "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rows.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No individuals match these filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ---------- Stool Logs Panel ----------

const STOOL_GROUP_OPTIONS: { value: string; label: string }[] = [
  { value: "bristol_type", label: "Bristol type" },
  { value: "health", label: "Health" },
  { value: "color", label: "Color" },
  { value: "consistency", label: "Consistency" },
  { value: "shape", label: "Shape" },
  { value: "quantity", label: "Quantity" },
  { value: "blood", label: "Blood" },
  { value: "mucus", label: "Mucus" },
  { value: "floating", label: "Floating" },
  { value: "sleep", label: "Sleep" },
  { value: "stress", label: "Stress" },
  { value: "diet", label: "Diet" },
  { value: "caffeine", label: "Caffeine" },
  { value: "toilet_time", label: "Toilet time" },
  { value: "frequency", label: "Frequency" },
  { value: "food_group", label: "Food group" },
  { value: "profile_sex", label: "Profile sex" },
  { value: "profile_diet", label: "Profile diet" },
  { value: "day", label: "By day" },
  { value: "week", label: "By week" },
  { value: "month", label: "By month" },
];

const BRISTOL_VALUES = [
  "Type 1",
  "Type 2",
  "Type 3",
  "Type 4",
  "Type 5",
  "Type 6",
  "Type 7",
];

const StoolLogsPanel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filters, setFilters] = useState<StoolLogsFilterParams>({
    page: 1,
    limit: 25,
  });
  const [rows, setRows] = useState<StoolLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<StoolLogStats | null>(null);

  const [groupBy, setGroupBy] = useState("bristol_type");
  const [agg, setAgg] = useState<AggregateRow[]>([]);
  const [aggLoading, setAggLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, stats] = await Promise.all([
        v2AnalyticsApi.listStoolLogs(filters),
        v2AnalyticsApi.stoolLogsStats(filters),
      ]);
      setRows(list.data);
      setTotal(list.meta.total);
      setStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAggregate = useCallback(async () => {
    setAggLoading(true);
    try {
      const res = await v2AnalyticsApi.stoolLogsAggregate(groupBy, filters);
      setAgg(res.data);
    } catch (e) {
      console.error("stool aggregate error", e);
    } finally {
      setAggLoading(false);
    }
  }, [groupBy, filters]);

  useEffect(() => {
    fetchData();
    fetchAggregate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (
    key: keyof StoolLogsFilterParams,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchData();
    fetchAggregate();
  };

  const handleReset = () => {
    const cleared: StoolLogsFilterParams = { page: 1, limit: 25 };
    setFilters(cleared);
    setTimeout(() => {
      fetchData();
      fetchAggregate();
    }, 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / (filters.limit ?? 25)));

  const fmt = (n: number | null, digits = 2) =>
    n === null || n === undefined ? "—" : Number(n).toFixed(digits);

  const fmtPct = (n: number | null) =>
    n === null || n === undefined ? "—" : `${(Number(n) * 100).toFixed(1)}%`;

  const isTimeSeries =
    groupBy === "day" || groupBy === "week" || groupBy === "month";

  return (
    <Box>
      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Matching logs
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {stats?.total.toLocaleString() ?? "—"}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Avg Bristol
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {fmt(stats?.avgBristol ?? null, 2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Avg pain
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {fmt(stats?.avgPain ?? null, 2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Avg smell
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {fmt(stats?.avgSmell ?? null, 2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Blood %
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {fmtPct(stats?.withBloodPct ?? null)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mucus %
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {fmtPct(stats?.withMucusPct ?? null)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters — stool logs
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Bristol type"
                value={filters.bristol_type ?? ""}
                onChange={(e) =>
                  updateFilter("bristol_type", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                {BRISTOL_VALUES.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Health"
                value={filters.health ?? ""}
                onChange={(e) => updateFilter("health", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="unhealthy">Unhealthy</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Color"
                value={filters.color ?? ""}
                onChange={(e) => updateFilter("color", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                {["black", "white", "green", "yellow", "red", "brown", "orange"].map(
                  (v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  )
                )}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Consistency"
                value={filters.consistency ?? ""}
                onChange={(e) =>
                  updateFilter("consistency", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                {["hard", "soft", "normal", "liquid"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Shape"
                value={filters.shape ?? ""}
                onChange={(e) => updateFilter("shape", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                {["sausage", "lumpy", "flat", "blob", "liquid"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Quantity"
                value={filters.quantity ?? ""}
                onChange={(e) =>
                  updateFilter("quantity", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                {["small", "normal", "large"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Blood"
                value={filters.blood ?? ""}
                onChange={(e) => updateFilter("blood", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                {["none", "trace", "moderate", "high"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Mucus"
                value={filters.mucus ?? ""}
                onChange={(e) => updateFilter("mucus", e.target.value || undefined)}
              >
                <MenuItem value="">Any</MenuItem>
                {["none", "trace", "moderate", "high"].map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Floating"
                value={filters.floating ?? ""}
                onChange={(e) =>
                  updateFilter("floating", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="float">Float</MenuItem>
                <MenuItem value="sink">Sink</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Lifestyle */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Sleep (category)"
                value={filters.sleep ?? ""}
                onChange={(e) => updateFilter("sleep", e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Stress (category)"
                value={filters.stress ?? ""}
                onChange={(e) => updateFilter("stress", e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Diet (category)"
                value={filters.diet ?? ""}
                onChange={(e) => updateFilter("diet", e.target.value || undefined)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Caffeine (category)"
                value={filters.caffeine ?? ""}
                onChange={(e) =>
                  updateFilter("caffeine", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Toilet time"
                value={filters.toilet_time ?? ""}
                onChange={(e) =>
                  updateFilter("toilet_time", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Frequency"
                value={filters.frequency ?? ""}
                onChange={(e) =>
                  updateFilter("frequency", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Food group (any of)"
                value={filters.food_group ?? ""}
                onChange={(e) =>
                  updateFilter("food_group", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Organization ID"
                type="number"
                value={filters.organization_id ?? ""}
                onChange={(e) =>
                  updateFilter("organization_id", e.target.value || undefined)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Numeric ranges */}
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Pain min"
                type="number"
                value={filters.pain_min ?? ""}
                onChange={(e) =>
                  updateFilter("pain_min", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Pain max"
                type="number"
                value={filters.pain_max ?? ""}
                onChange={(e) =>
                  updateFilter("pain_max", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Smell min"
                type="number"
                value={filters.smell_min ?? ""}
                onChange={(e) =>
                  updateFilter("smell_min", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Smell max"
                type="number"
                value={filters.smell_max ?? ""}
                onChange={(e) =>
                  updateFilter("smell_max", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Duration min"
                type="number"
                value={filters.duration_min ?? ""}
                onChange={(e) =>
                  updateFilter("duration_min", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Duration max"
                type="number"
                value={filters.duration_max ?? ""}
                onChange={(e) =>
                  updateFilter("duration_max", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Water min (glasses)"
                type="number"
                value={filters.water_min ?? ""}
                onChange={(e) =>
                  updateFilter("water_min", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Water max (glasses)"
                type="number"
                value={filters.water_max ?? ""}
                onChange={(e) =>
                  updateFilter("water_max", e.target.value || undefined)
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Profile snapshot filters */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Profile sex"
                value={filters.profile_sex ?? ""}
                onChange={(e) =>
                  updateFilter("profile_sex", e.target.value || undefined)
                }
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Profile diet"
                value={filters.profile_diet ?? ""}
                onChange={(e) =>
                  updateFilter("profile_diet", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Profile age min"
                type="number"
                value={filters.profile_age_min ?? ""}
                onChange={(e) =>
                  updateFilter("profile_age_min", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                label="Profile age max"
                type="number"
                value={filters.profile_age_max ?? ""}
                onChange={(e) =>
                  updateFilter("profile_age_max", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Created after"
                InputLabelProps={{ shrink: true }}
                value={filters.created_after ?? ""}
                onChange={(e) =>
                  updateFilter("created_after", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Created before"
                InputLabelProps={{ shrink: true }}
                value={filters.created_before ?? ""}
                onChange={(e) =>
                  updateFilter("created_before", e.target.value || undefined)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Individual ID (UUID)"
                value={filters.individual_id ?? ""}
                onChange={(e) =>
                  updateFilter("individual_id", e.target.value || undefined)
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} mt={2}>
            <Button variant="contained" onClick={handleSearch}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Aggregate chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
            <Typography variant="h6">Group stool logs by</Typography>
            <TextField
              select
              size="small"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 200 } }}
            >
              {STOOL_GROUP_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button onClick={fetchAggregate} variant="outlined" size="small">
              Refresh
            </Button>
          </Stack>
          {aggLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : agg.length === 0 ? (
            <Typography color="text.secondary">No data</Typography>
          ) : isTimeSeries ? (
            <Box sx={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={agg}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1976d2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Box sx={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={agg}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc004e" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={agg}
                        dataKey="count"
                        nameKey="bucket"
                        outerRadius={isMobile ? 70 : 110}
                        label={!isMobile}
                      >
                        {agg.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={PIE_COLORS[idx % PIE_COLORS.length] ?? "#1976d2"}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">
              Stool logs — {total.toLocaleString()} rows
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => {
                  setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }));
                  setTimeout(fetchData, 0);
                }}
              >
                Prev
              </Button>
              <Typography variant="body2" sx={{ alignSelf: "center" }}>
                Page {filters.page ?? 1} / {totalPages}
              </Typography>
              <Button
                size="small"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() => {
                  setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }));
                  setTimeout(fetchData, 0);
                }}
              >
                Next
              </Button>
            </Stack>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <TableContainer sx={{ maxHeight: { xs: 400, md: 600 } }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>Org</TableCell>
                    <TableCell>Bristol</TableCell>
                    <TableCell>Health</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Consistency</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Shape</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Quantity</TableCell>
                    <TableCell>Blood</TableCell>
                    <TableCell>Mucus</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Pain</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Smell</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Duration</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Water</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Diet</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Stress</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Sleep</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Food groups</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{r.organization_id}</TableCell>
                      <TableCell>{r.bristol_type ?? "—"}</TableCell>
                      <TableCell>{r.health ?? "—"}</TableCell>
                      <TableCell>{r.color ?? "—"}</TableCell>
                      <TableCell>{r.consistency ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.shape ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.quantity ?? "—"}</TableCell>
                      <TableCell>{r.blood ?? "—"}</TableCell>
                      <TableCell>{r.mucus ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.pain_level ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.smell_level ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.duration_minutes ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.water_glasses ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.diet ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.stress ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{r.sleep ?? "—"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                        {r.food_groups && r.food_groups.length > 0 ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {r.food_groups.slice(0, 3).map((fg, idx) => (
                              <Chip
                                key={idx}
                                label={fg}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {r.food_groups.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{r.food_groups.length - 3}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={18} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>
                          No stool logs match these filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// ---------- Top-level view ----------

const V2AnalyticsView: React.FC = () => {
  const [tab, setTab] = useState<"individuals" | "stool_logs">("individuals");
  const [overview, setOverview] = useState<V2Overview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const o = await v2AnalyticsApi.getOverview();
        if (active) setOverview(o);
      } catch (e) {
        if (active)
          setOverviewError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (active) setOverviewLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const tabPanel = useMemo(() => {
    if (tab === "individuals") return <IndividualsPanel />;
    return <StoolLogsPanel />;
  }, [tab]);

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 1.5, sm: 2, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          V2 App Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Query softai.individuals and softai.stool_logs directly.
        </Typography>
      </Box>

      {overviewError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {overviewError}
        </Alert>
      )}
      <OverviewCards overview={overview} loading={overviewLoading} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="individuals" label="Individuals" />
        <Tab value="stool_logs" label="Stool logs" />
      </Tabs>

      {tabPanel}
    </Container>
  );
};

export default V2AnalyticsView;
