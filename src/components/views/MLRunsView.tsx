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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import {
  BenchmarkRun,
  TrainingRun,
  mlRunsApi,
} from "../../services/api.mlRuns";

const FIELDS = [
  "bristol_type",
  "consistency",
  "shape",
  "quantity",
  "color",
  "health",
  "blood",
  "mucus",
  "floating",
] as const;

const pct = (v?: number | null, digits = 1) =>
  v === undefined || v === null || Number.isNaN(v) ? "—" : `${(v * 100).toFixed(digits)}%`;
const num = (v?: number | null, digits = 4) =>
  v === undefined || v === null || Number.isNaN(v) ? "—" : v.toFixed(digits);

/** Colour a metric by how good it is, so problems are visible at a glance. */
function scoreColor(v?: number | null): "success" | "warning" | "error" | "default" {
  if (v === undefined || v === null) return "default";
  if (v >= 0.8) return "success";
  if (v >= 0.5) return "warning";
  return "error";
}

const TrainingRunCard: React.FC<{ run: TrainingRun; isLatest: boolean }> = ({
  run,
  isLatest,
}) => {
  const m = run.metrics ?? {};
  const d = run.dataset ?? {};
  const s = run.split ?? {};
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6">{run.run_id}</Typography>
          {isLatest && <Chip size="small" color="primary" label="latest" />}
          <Chip
            size="small"
            color={scoreColor(m.composite)}
            label={`composite ${num(m.composite)}`}
          />
          {d.gold_set_excluded ? (
            <Tooltip title="Benchmark gold set was held out of training — this run's benchmark numbers can be published">
              <Chip size="small" color="success" variant="outlined" label="publishable" />
            </Tooltip>
          ) : (
            <Tooltip title="Gold set was NOT held out — this run trained on benchmark images, so its benchmark numbers are not publishable">
              <Chip size="small" color="error" variant="outlined" label="not publishable" />
            </Tooltip>
          )}
          <Box flexGrow={1} />
          <Typography variant="caption" color="text.secondary">
            {new Date(run.created_at).toLocaleString()}
          </Typography>
        </Stack>

        {run.git?.dirty && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
            Working tree was dirty at publish time — the git sha below does not
            fully describe the code that produced these numbers.
          </Alert>
        )}

        <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mt: 1.5, mb: 1.5 }}>
          <Typography variant="body2">
            <b>Bristol</b> {pct(m.bristol_accuracy)} &nbsp;
            <Typography component="span" variant="caption" color="text.secondary">
              (±1 {pct(m.bristol_pm1_accuracy)})
            </Typography>
          </Typography>
          <Typography variant="body2">
            <b>Colour macro-F1</b> {num(m.color_macro_f1_trainable, 3)}
          </Typography>
          <Typography variant="body2">
            <b>Best epoch</b> {run.training?.best_epoch ?? "—"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Typography variant="caption" color="text.secondary">
            Dataset: {d.rows?.toLocaleString() ?? "—"} rows · {d.n_groups?.toLocaleString() ?? "—"} groups · {d.csv ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Split: {s.strategy ?? "—"} · train {s.train_rows?.toLocaleString() ?? "—"} / val {s.val_rows?.toLocaleString() ?? "—"} · seed {s.seed ?? "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            git {run.git?.sha?.slice(0, 8) ?? "—"} ({run.git?.branch ?? "—"})
          </Typography>
        </Stack>

        {m.secondary_macro_f1 && (
          <Table size="small" sx={{ mt: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>field</TableCell>
                <TableCell align="right">accuracy</TableCell>
                <TableCell align="right">macro-F1</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(m.secondary_macro_f1).map((f) => (
                <TableRow key={f}>
                  <TableCell>{f}</TableCell>
                  <TableCell align="right">
                    {pct(m.secondary_accuracy?.[f])}
                  </TableCell>
                  <TableCell align="right">
                    {num(m.secondary_macro_f1?.[f], 3)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {run.artifacts?.onnx_md5 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            ONNX md5 {run.artifacts.onnx_md5}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const BenchmarkCard: React.FC<{
  bench: BenchmarkRun;
  linkedRun?: TrainingRun | undefined;
}> = ({
  bench,
  linkedRun,
}) => {
  // Highest composite first — this is the leaderboard ordering.
  const rows = useMemo(
    () =>
      Object.entries(bench.models).sort(
        (a, b) => (b[1].composite ?? 0) - (a[1].composite ?? 0),
      ),
    [bench.models],
  );
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6">{bench.run_id}</Typography>
          <Chip size="small" label={`gold set ${bench.gold_set_size ?? "—"}`} />
          {bench.prompt_version && (
            <Chip size="small" variant="outlined" label={`prompt v${bench.prompt_version}`} />
          )}
          {bench.model_run_id && (
            <Chip size="small" variant="outlined" label={`model ${bench.model_run_id}`} />
          )}
          <Box flexGrow={1} />
          <Typography variant="caption" color="text.secondary">
            scored {bench.scored_at ?? "—"}
          </Typography>
        </Stack>

        {linkedRun && !linkedRun.dataset?.gold_set_excluded && (
          <Alert severity="error" icon={<WarningIcon />} sx={{ mt: 1.5 }}>
            The <b>poopcheck</b> row is not publishable: training run{" "}
            <b>{linkedRun.run_id}</b> did not hold out the gold set, so it was
            scored partly on images it trained on. Its numbers here are
            inflated by memorisation — the frontier-model rows are unaffected.
          </Alert>
        )}

        <Box sx={{ overflowX: "auto", mt: 1.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>model</TableCell>
                <TableCell align="right">composite</TableCell>
                {FIELDS.map((f) => (
                  <TableCell key={f} align="right">
                    {f.replace("_type", "")}
                  </TableCell>
                ))}
                <TableCell align="right">blood recall</TableCell>
                <TableCell align="right">refusals</TableCell>
                <TableCell align="right">predicted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(([model, score]) => (
                <TableRow key={model}>
                  <TableCell><b>{model}</b></TableCell>
                  <TableCell align="right">
                    <Chip size="small" color={scoreColor(score.composite)} label={num(score.composite, 3)} />
                  </TableCell>
                  {FIELDS.map((f) => (
                    <TableCell key={f} align="right">
                      {pct(score.fields?.[f]?.accuracy, 0)}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {/* Safety-critical: high accuracy here can hide ~0 recall. */}
                    <Tooltip title="Detection recall on blood — accuracy alone hides an always-'none' model">
                      <span>{pct(score.fields?.["blood"]?.detection_recall, 1)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{pct(score.refusal_rate, 0)}</TableCell>
                  <TableCell align="right">
                    {/* Predictions can long predate the scoring run; a stale
                        row is otherwise indistinguishable from a fresh one. */}
                    {score.predicted_at && bench.scored_at &&
                     score.predicted_at !== bench.scored_at ? (
                      <Tooltip title={`These predictions were generated on ${score.predicted_at}, before this scoring run — they may come from an older model.`}>
                        <Chip size="small" color="warning" variant="outlined"
                              label={score.predicted_at} />
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {score.predicted_at ?? "—"}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};

const MLRunsView: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [runs, setRuns] = useState<TrainingRun[]>([]);
  const [benches, setBenches] = useState<BenchmarkRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (hardRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      if (hardRefresh) await mlRunsApi.refresh();
      const [r, b] = await Promise.all([
        mlRunsApi.listRuns(),
        mlRunsApi.listBenchmarks(),
      ]);
      setRuns(r);
      setBenches(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ML runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Model Training &amp; Benchmarks</Typography>
        <Box flexGrow={1} />
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => void load(true)}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Training runs (${runs.length})`} />
        <Tab label={`Benchmarks (${benches.length})`} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : tab === 0 ? (
        runs.length === 0 ? (
          <Alert severity="info">
            No training runs published yet. After a run finishes, publish one with{" "}
            <code>python deployment/ml/run_manifest.py --backfill --run-id &lt;id&gt;</code>.
          </Alert>
        ) : (
          runs.map((r, i) => (
            <TrainingRunCard key={r.run_id} run={r} isLatest={i === 0} />
          ))
        )
      ) : benches.length === 0 ? (
        <Alert severity="info">
          No benchmark results yet. Run{" "}
          <code>python benchmark/score.py --run-id &lt;id&gt; --publish</code>.
        </Alert>
      ) : (
        benches.map((b) => (
          <BenchmarkCard
            key={b.run_id}
            bench={b}
            linkedRun={runs.find((r) => r.run_id === b.model_run_id)}
          />
        ))
      )}
    </Container>
  );
};

export default MLRunsView;
