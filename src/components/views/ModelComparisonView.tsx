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
  Typography,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  CheckCircle as MatchIcon,
  ErrorOutline as DiffIcon,
  PlayArrow as RunIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import {
  ComparisonResult,
  ModelPrediction,
  SecondaryTaskName,
  TaskPrediction,
  modelComparisonApi,
} from "../../services/api.modelComparison";

// ============================================================================
// Helpers
// ============================================================================

const SECONDARY_ORDER: SecondaryTaskName[] = [
  "color",
  "blood",
  "mucus",
  "consistency",
  "shape",
  "quantity",
  "health",
  "floating",
];

const TASK_DISPLAY_NAMES: Record<SecondaryTaskName | "bristolType", string> = {
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

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Probability bar for a single class
// ============================================================================

interface ProbBarProps {
  label: string;
  prob: number;
  isArgmax: boolean;
  /** Highlight this row as a disagreement between the two models. */
  disagreement?: boolean;
}

const ProbBar: React.FC<ProbBarProps> = ({ label, prob, isArgmax, disagreement }) => {
  const pct = prob * 100;
  const barColor = disagreement
    ? "#ff6b6b"
    : isArgmax
      ? "#9BF0FF"
      : "rgba(255,255,255,0.25)";
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
          {pct.toFixed(1)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(255,255,255,0.08)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: barColor,
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
  prediction: TaskPrediction;
  otherArgmax: number;
}

const TaskPanel: React.FC<TaskPanelProps> = ({
  taskName,
  prediction,
  otherArgmax,
}) => {
  const disagrees = prediction.argmax !== otherArgmax;
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
        <Chip
          size="small"
          icon={disagrees ? <DiffIcon /> : <MatchIcon />}
          label={`${prediction.argmaxLabel} ${(prediction.confidence * 100).toFixed(0)}%`}
          sx={{
            fontWeight: 700,
            textTransform: "capitalize",
            backgroundColor: disagrees
              ? "rgba(255,107,107,0.15)"
              : "rgba(155,240,255,0.15)",
            color: disagrees ? "#ff6b6b" : "#9BF0FF",
            border: `1px solid ${disagrees ? "rgba(255,107,107,0.4)" : "rgba(155,240,255,0.4)"}`,
            "& .MuiChip-icon": {
              color: disagrees ? "#ff6b6b" : "#9BF0FF",
            },
          }}
        />
      </Box>
      {prediction.labels.map((label, i) => (
        <ProbBar
          key={label}
          label={label}
          prob={prediction.probs[i] || 0}
          isArgmax={i === prediction.argmax}
          disagreement={disagrees && i === prediction.argmax}
        />
      ))}
    </Box>
  );
};

// ============================================================================
// Single model panel (shows all tasks for one model)
// ============================================================================

interface ModelPanelProps {
  title: string;
  subtitle: string;
  prediction: ModelPrediction;
  other: ModelPrediction;
  accentColor: string;
}

const ModelPanel: React.FC<ModelPanelProps> = ({
  title,
  subtitle,
  prediction,
  other,
  accentColor,
}) => {
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
            {title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.4)", display: "block", fontFamily: "monospace" }}
          >
            {subtitle}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            Inference: {prediction.inferenceMs} ms
          </Typography>
        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

        <TaskPanel
          taskName={TASK_DISPLAY_NAMES.bristolType}
          prediction={prediction.bristolType}
          otherArgmax={other.bristolType.argmax}
        />

        {SECONDARY_ORDER.map((name) => (
          <TaskPanel
            key={name}
            taskName={TASK_DISPLAY_NAMES[name]}
            prediction={prediction.secondary[name]}
            otherArgmax={other.secondary[name].argmax}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Summary strip — quick at-a-glance of which tasks the models disagree on
// ============================================================================

interface DisagreementSummaryProps {
  result: ComparisonResult;
}

const DisagreementSummary: React.FC<DisagreementSummaryProps> = ({ result }) => {
  const diffs: { name: string; production: string; candidate: string }[] = useMemo(() => {
    const out: { name: string; production: string; candidate: string }[] = [];
    if (result.production.bristolType.argmax !== result.candidate.bristolType.argmax) {
      out.push({
        name: TASK_DISPLAY_NAMES.bristolType,
        production: result.production.bristolType.argmaxLabel,
        candidate: result.candidate.bristolType.argmaxLabel,
      });
    }
    SECONDARY_ORDER.forEach((n) => {
      if (result.production.secondary[n].argmax !== result.candidate.secondary[n].argmax) {
        out.push({
          name: TASK_DISPLAY_NAMES[n],
          production: result.production.secondary[n].argmaxLabel,
          candidate: result.candidate.secondary[n].argmaxLabel,
        });
      }
    });
    return out;
  }, [result]);

  if (diffs.length === 0) {
    return (
      <Alert
        icon={<MatchIcon />}
        severity="success"
        sx={{
          mb: 3,
          backgroundColor: "rgba(155,240,255,0.08)",
          border: "1px solid rgba(155,240,255,0.3)",
          color: "#9BF0FF",
          "& .MuiAlert-icon": { color: "#9BF0FF" },
        }}
      >
        Both models agree on all 9 predictions.
      </Alert>
    );
  }

  return (
    <Alert
      icon={<DiffIcon />}
      severity="warning"
      sx={{
        mb: 3,
        backgroundColor: "rgba(255,107,107,0.08)",
        border: "1px solid rgba(255,107,107,0.3)",
        color: "#ff6b6b",
        "& .MuiAlert-icon": { color: "#ff6b6b" },
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {diffs.length} disagreement{diffs.length > 1 ? "s" : ""}:
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {diffs.map((d) => (
          <Chip
            key={d.name}
            size="small"
            label={`${d.name}: ${d.production} → ${d.candidate}`}
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
    </Alert>
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
          Upload an image to score it against the currently deployed{" "}
          <strong>Production</strong> model and a new <strong>Candidate</strong>{" "}
          model side-by-side. Disagreements are highlighted in red. Use this to
          spot-check candidate behavior before deploying.
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
                        {loading ? "Comparing…" : "Compare models"}
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
      {result && (
        <>
          <DisagreementSummary result={result} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ModelPanel
                title="Production (currently deployed)"
                subtitle={result.productionModelPath}
                prediction={result.production}
                other={result.candidate}
                accentColor="#FCFF59"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ModelPanel
                title="Candidate (new)"
                subtitle={result.candidateModelPath}
                prediction={result.candidate}
                other={result.production}
                accentColor="#9BF0FF"
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default ModelComparisonView;
