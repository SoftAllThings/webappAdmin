import React, { useCallback, useMemo, useRef, useState } from "react";
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
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as MatchIcon,
  ErrorOutline as DiffIcon,
  CallSplit as SplitIcon,
  PlayArrow as RunIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import {
  ComparedModel,
  ComparisonResult,
  FieldName,
  ModelRun,
  TaskPrediction,
  modelComparisonApi,
} from "../../services/api.modelComparison";

// ============================================================================
// Helpers
// ============================================================================

const FIELD_ORDER: FieldName[] = [
  "bristolType",
  "color",
  "blood",
  "mucus",
  "consistency",
  "shape",
  "quantity",
  "health",
  "floating",
];

const FIELD_DISPLAY_NAMES: Record<FieldName, string> = {
  bristolType: "Bristol Type",
  color: "Color",
  blood: "Blood",
  mucus: "Mucus",
  consistency: "Consistency",
  shape: "Shape",
  quantity: "Quantity",
  health: "Health",
  floating: "Floating",
};

interface ModelMeta {
  key: ComparedModel;
  title: string;
  /** Column header in the agreement table. */
  short: string;
  accentColor: string;
}

const MODELS: ModelMeta[] = [
  {
    key: "production",
    title: "Production (currently deployed)",
    short: "Production",
    accentColor: "#FCFF59",
  },
  { key: "candidate", title: "Candidate (new)", short: "Candidate", accentColor: "#9BF0FF" },
  { key: "gpt", title: "GPT (production voter)", short: "GPT", accentColor: "#C3A6FF" },
  { key: "gemini", title: "Gemini (production voter)", short: "Gemini", accentColor: "#8AB4F8" },
];

/** How one model's pick for a field relates to the other models' picks. */
type Agreement = "agree" | "outlier" | "split" | "solo";

const AGREEMENT_COLORS: Record<Agreement, string> = {
  /** Matches the majority. */
  agree: "#9BF0FF",
  /** Differs from the majority. */
  outlier: "#ff6b6b",
  /** Tie — no majority to compare against. */
  split: "#FFB347",
  /** The only model that answered. */
  solo: "#B0B8C8",
};

const AGREEMENT_ICONS: Record<Agreement, React.ReactElement> = {
  agree: <MatchIcon />,
  outlier: <DiffIcon />,
  split: <SplitIcon />,
  solo: <MatchIcon />,
};

interface FieldAgreement {
  /** The label most answering models picked; null on a tie. */
  majority: string | null;
  /** Models that picked `majority`. */
  votes: number;
  /** Models that returned an answer for this field. */
  answered: number;
  byModel: Partial<Record<ComparedModel, Agreement>>;
}

function fieldPick(run: ModelRun, field: FieldName): TaskPrediction | null {
  return run.ok ? run.prediction.fields[field] : null;
}

function computeFieldAgreement(
  result: ComparisonResult,
  field: FieldName,
): FieldAgreement {
  const picks: { key: ComparedModel; label: string }[] = [];
  MODELS.forEach((m) => {
    const p = fieldPick(result[m.key], field);
    if (p) picks.push({ key: m.key, label: p.argmaxLabel });
  });

  const counts: Record<string, number> = {};
  picks.forEach(({ label }) => {
    counts[label] = (counts[label] ?? 0) + 1;
  });
  const top = Math.max(0, ...Object.keys(counts).map((l) => counts[l] ?? 0));
  const leaders = Object.keys(counts).filter((l) => counts[l] === top);
  const majority = leaders.length === 1 ? (leaders[0] ?? null) : null;

  const byModel: Partial<Record<ComparedModel, Agreement>> = {};
  picks.forEach(({ key, label }) => {
    byModel[key] =
      picks.length < 2
        ? "solo"
        : majority === null
          ? "split"
          : label === majority
            ? "agree"
            : "outlier";
  });

  return { majority, votes: top, answered: picks.length, byModel };
}

function computeAgreement(
  result: ComparisonResult,
): Record<FieldName, FieldAgreement> {
  const out = {} as Record<FieldName, FieldAgreement>;
  FIELD_ORDER.forEach((f) => {
    out[f] = computeFieldAgreement(result, f);
  });
  return out;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const pct = (x: number): string => `${(x * 100).toFixed(0)}%`;

// ============================================================================
// Probability bar for a single class
// ============================================================================

interface ProbBarProps {
  label: string;
  /** null when the model gives no probability for this class (LLMs only score their pick). */
  prob: number | null;
  isArgmax: boolean;
  /** Bar color for the picked class — reflects agreement with the other models. */
  argmaxColor: string;
}

const ProbBar: React.FC<ProbBarProps> = ({ label, prob, isArgmax, argmaxColor }) => {
  const value = (prob ?? 0) * 100;
  return (
    <Box sx={{ mb: 0.75 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 0.25,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: isArgmax ? 700 : 400,
            color: isArgmax ? "#fff" : "rgba(255,255,255,0.6)",
            textTransform: "capitalize",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: isArgmax ? "#fff" : "rgba(255,255,255,0.5)",
            fontWeight: isArgmax ? 700 : 400,
          }}
        >
          {prob === null ? "—" : `${value.toFixed(1)}%`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: isArgmax ? argmaxColor : "rgba(255,255,255,0.25)",
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
};

// ============================================================================
// Task panel (single task, single model)
// ============================================================================

interface TaskPanelProps {
  taskName: string;
  prediction: TaskPrediction | null;
  agreement: Agreement;
}

const TaskPanel: React.FC<TaskPanelProps> = ({ taskName, prediction, agreement }) => {
  const color = AGREEMENT_COLORS[agreement];
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.1em",
            fontSize: "0.7rem",
          }}
        >
          {taskName}
        </Typography>
        {prediction ? (
          <Chip
            size="small"
            icon={AGREEMENT_ICONS[agreement]}
            label={`${prediction.argmaxLabel} ${pct(prediction.confidence)}`}
            sx={{
              fontWeight: 700,
              textTransform: "capitalize",
              backgroundColor: `${color}26`,
              color,
              border: `1px solid ${color}66`,
              "& .MuiChip-icon": { color },
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            No valid answer
          </Typography>
        )}
      </Box>
      {prediction &&
        prediction.labels.map((label, i) => (
          <ProbBar
            key={label}
            label={label}
            prob={
              prediction.probs
                ? (prediction.probs[i] ?? 0)
                : i === prediction.argmax
                  ? prediction.confidence
                  : null
            }
            isArgmax={i === prediction.argmax}
            argmaxColor={color}
          />
        ))}
    </Box>
  );
};

// ============================================================================
// Single model panel (shows all tasks for one model)
// ============================================================================

interface ModelPanelProps {
  meta: ModelMeta;
  run: ModelRun;
  agreement: Record<FieldName, FieldAgreement>;
}

const ModelPanel: React.FC<ModelPanelProps> = ({ meta, run, agreement }) => {
  const { accentColor } = meta;
  const gate = run.ok ? run.prediction.gate : null;
  const isLlm = run.ok && FIELD_ORDER.some((f) => run.prediction.fields[f]?.probs === null);
  return (
    <Card
      sx={{
        backgroundColor: "rgba(15,22,41,0.6)",
        border: `1px solid ${accentColor}33`,
        borderRadius: 2,
        height: "100%",
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: accentColor }}>
            {meta.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.4)",
              display: "block",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {run.source}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", display: "block" }}>
            Inference: {run.inferenceMs} ms
          </Typography>
          {isLlm && (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}>
              Reports a confidence for its pick only.
            </Typography>
          )}
          {gate && (
            <Chip
              size="small"
              icon={gate.isStool ? <MatchIcon /> : <DiffIcon />}
              label={`${gate.isStool ? "Stool" : "Not stool"} ${pct(gate.confidence)}`}
              sx={{
                mt: 1,
                fontWeight: 700,
                backgroundColor: gate.isStool ? "rgba(155,240,255,0.15)" : "rgba(255,107,107,0.15)",
                color: gate.isStool ? "#9BF0FF" : "#ff6b6b",
                "& .MuiChip-icon": { color: gate.isStool ? "#9BF0FF" : "#ff6b6b" },
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

        {run.ok ? (
          FIELD_ORDER.map((name) => (
            <TaskPanel
              key={name}
              taskName={FIELD_DISPLAY_NAMES[name]}
              prediction={run.prediction.fields[name]}
              agreement={agreement[name].byModel[meta.key] ?? "solo"}
            />
          ))
        ) : (
          <Alert severity="error" sx={{ wordBreak: "break-word" }}>
            {run.error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Agreement table — every model's pick per field, side by side
// ============================================================================

interface AgreementTableProps {
  result: ComparisonResult;
  agreement: Record<FieldName, FieldAgreement>;
}

const cellSx = { borderColor: "rgba(255,255,255,0.06)", py: 1 };
const mutedSx = { color: "rgba(255,255,255,0.4)" };

const AgreementTable: React.FC<AgreementTableProps> = ({ result, agreement }) => {
  const ran = MODELS.filter((m) => result[m.key].ok);
  const unanimous = FIELD_ORDER.filter((f) => {
    const a = agreement[f];
    return a.majority !== null && a.answered >= 2 && a.votes === a.answered;
  }).length;

  // The page's original question: what would change if Candidate replaced Production?
  const production = result.production;
  const candidate = result.candidate;
  const candidateDiffs =
    production.ok && candidate.ok
      ? FIELD_ORDER.filter(
          (f) =>
            fieldPick(production, f)?.argmaxLabel !== fieldPick(candidate, f)?.argmaxLabel,
        )
      : null;

  return (
    <Card
      sx={{
        mb: 3,
        backgroundColor: "rgba(15,22,41,0.6)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {ran.length === MODELS.length
            ? `All ${MODELS.length} models agree on ${unanimous} of ${FIELD_ORDER.length} fields.`
            : `The ${ran.length} models that ran agree on ${unanimous} of ${FIELD_ORDER.length} fields.`}
        </Typography>

        {candidateDiffs && (
          <Box sx={{ mt: 1 }}>
            {candidateDiffs.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#9BF0FF" }}>
                Candidate matches Production on every field.
              </Typography>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                <Typography variant="body2" sx={{ color: "#ff9b9b" }}>
                  Candidate vs Production:
                </Typography>
                {candidateDiffs.map((f) => (
                  <Chip
                    key={f}
                    size="small"
                    label={`${FIELD_DISPLAY_NAMES[f]}: ${fieldPick(production, f)?.argmaxLabel ?? "—"} → ${fieldPick(candidate, f)?.argmaxLabel ?? "—"}`}
                    sx={{
                      backgroundColor: "rgba(255,107,107,0.15)",
                      color: "#ff9b9b",
                      textTransform: "capitalize",
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        )}

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...cellSx, ...mutedSx }}>Field</TableCell>
                {MODELS.map((m) => {
                  const run = result[m.key];
                  const agrees = FIELD_ORDER.filter(
                    (f) => agreement[f].byModel[m.key] === "agree",
                  ).length;
                  return (
                    <TableCell key={m.key} sx={cellSx}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: m.accentColor }}>
                        {m.short}
                      </Typography>
                      <Typography variant="caption" sx={mutedSx}>
                        {run.ok
                          ? `${agrees}/${FIELD_ORDER.length} with majority`
                          : "failed"}
                      </Typography>
                    </TableCell>
                  );
                })}
                <TableCell sx={{ ...cellSx, ...mutedSx }}>Majority</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ ...cellSx, ...mutedSx }}>Is stool?</TableCell>
                {MODELS.map((m) => {
                  const run = result[m.key];
                  const gate = run.ok ? run.prediction.gate : null;
                  return (
                    <TableCell key={m.key} sx={cellSx}>
                      {gate ? (
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: gate.isStool ? "#9BF0FF" : "#ff6b6b" }}
                        >
                          {gate.isStool ? "Yes" : "No"}{" "}
                          <Typography component="span" variant="caption" sx={mutedSx}>
                            {pct(gate.confidence)}
                          </Typography>
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={mutedSx}>
                          {run.ok ? "no gate" : "—"}
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell sx={cellSx} />
              </TableRow>
              {FIELD_ORDER.map((f) => {
                const a = agreement[f];
                return (
                  <TableRow key={f}>
                    <TableCell sx={{ ...cellSx, ...mutedSx }}>{FIELD_DISPLAY_NAMES[f]}</TableCell>
                    {MODELS.map((m) => {
                      const run = result[m.key];
                      const p = fieldPick(run, f);
                      const color = AGREEMENT_COLORS[a.byModel[m.key] ?? "solo"];
                      return (
                        <TableCell key={m.key} sx={cellSx}>
                          {p ? (
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color, textTransform: "capitalize" }}
                            >
                              {p.argmaxLabel}{" "}
                              <Typography component="span" variant="caption" sx={mutedSx}>
                                {pct(p.confidence)}
                              </Typography>
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={mutedSx}>
                              {run.ok ? "no answer" : "—"}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell sx={cellSx}>
                      {a.majority !== null ? (
                        <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                          {a.majority}{" "}
                          <Typography component="span" variant="caption" sx={mutedSx}>
                            {a.votes}/{a.answered}
                          </Typography>
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: AGREEMENT_COLORS.split }}>
                          {a.answered ? "split" : "—"}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mt: 1.5 }}>
          {(["agree", "outlier", "split"] as Agreement[]).map((k) => (
            <Typography key={k} variant="caption" sx={{ color: AGREEMENT_COLORS[k] }}>
              ● {k === "agree" ? "matches majority" : k === "outlier" ? "differs from majority" : "tied, no majority"}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Main view
// ============================================================================

const ModelComparisonView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const agreement = useMemo(() => (result ? computeAgreement(result) : null), [result]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("Please pick an image file (jpg/png).");
      return;
    }
    try {
      const dataUrl = await readFileAsBase64(file);
      setImageBase64(dataUrl);
      setImageName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read file");
    }
  }, []);

  const handlePick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleRun = useCallback(async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await modelComparisonApi.compare(imageBase64);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }, [imageBase64]);

  const handleReset = useCallback(() => {
    setImageBase64(null);
    setImageName(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: "center", mt: { xs: 1, md: 4 }, mb: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.5rem", md: "3rem" },
          }}
          gutterBottom
        >
          Model Comparison
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 760, mx: "auto" }}
        >
          Upload an image to score it with the currently deployed{" "}
          <strong>Production</strong> model, a new <strong>Candidate</strong>{" "}
          model, and the <strong>GPT</strong> and <strong>Gemini</strong> voters
          that production's ensemble runs alongside it. Each pick is compared to
          what the majority of models chose: picks that differ are red, ties are
          amber.
        </Typography>
      </Box>

      {/* Upload / image-preview / run */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: "rgba(15,22,41,0.6)",
          border: dragOver
            ? "2px dashed #9BF0FF"
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: 2,
          transition: "border 120ms",
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={imageBase64 ? 4 : 12}>
              <Box
                onClick={handlePick}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                sx={{
                  border: "2px dashed rgba(155,240,255,0.3)",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "background 120ms",
                  "&:hover": {
                    backgroundColor: "rgba(155,240,255,0.04)",
                    borderColor: "rgba(155,240,255,0.5)",
                  },
                }}
              >
                <UploadIcon
                  sx={{ fontSize: 48, color: "#9BF0FF", mb: 1, opacity: 0.7 }}
                />
                <Typography variant="body1" sx={{ color: "#9BF0FF" }}>
                  {imageBase64
                    ? "Pick a different image"
                    : "Click or drop an image"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.4)" }}
                >
                  jpg / png — sent base64 to the backend
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </Box>
            </Grid>

            {imageBase64 && (
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={imageBase64}
                    alt={imageName || ""}
                    sx={{
                      width: 140,
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        display: "block",
                        wordBreak: "break-all",
                      }}
                    >
                      {imageName}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={
                          loading ? (
                            <CircularProgress size={18} sx={{ color: "#000" }} />
                          ) : (
                            <RunIcon />
                          )
                        }
                        onClick={handleRun}
                        disabled={loading}
                        sx={{
                          backgroundColor: "#9BF0FF",
                          color: "#000",
                          fontWeight: 700,
                          "&:hover": { backgroundColor: "#7adfee" },
                          "&.Mui-disabled": {
                            backgroundColor: "rgba(155,240,255,0.3)",
                            color: "rgba(0,0,0,0.5)",
                          },
                        }}
                      >
                        {loading ? "Running 4 models…" : "Compare models"}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ResetIcon />}
                        onClick={handleReset}
                        disabled={loading}
                        sx={{
                          borderColor: "rgba(255,255,255,0.2)",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results */}
      {result && agreement && (
        <>
          <AgreementTable result={result} agreement={agreement} />
          <Grid container spacing={3}>
            {MODELS.map((m) => (
              <Grid item xs={12} md={6} lg={3} key={m.key}>
                <ModelPanel meta={m} run={result[m.key]} agreement={agreement} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ModelComparisonView;
