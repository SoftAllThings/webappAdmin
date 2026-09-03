import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import {
  fetchExportDatasets,
  downloadExport,
  type ExportDataset,
} from "../../services/api.export";

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const ExportView: React.FC = () => {
  const [datasets, setDatasets] = useState<ExportDataset[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [includeEmails, setIncludeEmails] = useState(false);
  const [includeRawPayloads, setIncludeRawPayloads] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    fetchExportDatasets()
      .then((d) => {
        setDatasets(d);
        setSelected(new Set(d.map((x) => x.key)));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"));
  }, []);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const rangeInvalid = from > to;
  const canRun = selected.size > 0 && !rangeInvalid && !busy;

  const run = async () => {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const filename = await downloadExport({
        from,
        to,
        datasets: Array.from(selected),
        includeEmails,
        includeRawPayloads,
      });
      setDone(filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Export data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Downloads a zip of CSVs plus a README.md data dictionary. The README
            explains which columns are misleading — keep it with the data when
            you hand it to an AI to analyse.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Date range (UTC, inclusive)
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          {rangeInvalid && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
              "From" must be on or before "To".
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tables
          </Typography>
          {datasets.length === 0 && !error && <CircularProgress size={20} />}
          <Stack spacing={1.5}>
            {datasets.map((d) => (
              <Box key={d.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selected.has(d.key)}
                      onChange={() => toggle(d.key)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{d.label}</span>
                      <Chip
                        size="small"
                        label={d.source === "postgres" ? "SoftAI / Postgres" : "PoopCheck / Firebase"}
                        color={d.source === "postgres" ? "secondary" : "default"}
                        variant="outlined"
                      />
                    </Stack>
                  }
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", pl: 4, mt: -0.5 }}
                >
                  {d.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sensitive fields
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Off by default. The export is pseudonymous without these — IDs still
            join across tables.
          </Typography>
          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeEmails}
                  onChange={(e) => setIncludeEmails(e.target.checked)}
                />
              }
              label="Include user email addresses"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeRawPayloads}
                  onChange={(e) => setIncludeRawPayloads(e.target.checked)}
                />
              }
              label="Include raw JSON payloads (app_payload, profile_data, profile_snapshot)"
            />
          </Stack>
          {(includeEmails || includeRawPayloads) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              This export will contain personal data. The SoftAI tables are
              customer health records — check your obligations before sharing
              the file or uploading it anywhere.
            </Alert>
          )}
        </Paper>

        <Divider />

        {error && <Alert severity="error">{error}</Alert>}
        {done && <Alert severity="success">Downloaded {done}</Alert>}

        <Box>
          <Button
            variant="contained"
            size="large"
            startIcon={busy ? <CircularProgress size={18} /> : <DownloadIcon />}
            disabled={!canRun}
            onClick={() => void run()}
          >
            {busy ? "Building export…" : "Export CSV bundle"}
          </Button>
          {busy && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
              Large ranges can take a while — the file downloads when it's ready.
            </Typography>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default ExportView;
