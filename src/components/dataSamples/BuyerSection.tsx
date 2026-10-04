import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add as AddIcon, History as HistoryIcon } from "@mui/icons-material";
import { Buyer, SampleExport, dataSamplesApi } from "../../services/api.dataSamples";

interface Props {
  buyers: Buyer[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onCreated: (buyer: Buyer) => void;
  lastExport: SampleExport | null;
  onLoadLast: () => void;
}

const fmtDate = (s: string) => new Date(s).toLocaleDateString();

const BuyerSection: React.FC<Props> = ({
  buyers,
  selectedId,
  onSelect,
  onCreated,
  lastExport,
  onLoadLast,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = buyers.find((b) => b.id === selectedId) ?? null;

  const create = async () => {
    setSaving(true);
    setError(null);
    try {
      const buyer = await dataSamplesApi.createBuyer(name.trim(), notes.trim());
      onCreated(buyer);
      setDialogOpen(false);
      setName("");
      setNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create buyer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
        <TextField
          select
          size="small"
          label="Buyer"
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value === "" ? null : Number(e.target.value))}
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="">
            <em>Pick a buyer…</em>
          </MenuItem>
          {buyers.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New buyer
        </Button>
      </Stack>

      {selected && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          sx={{ mt: 1.5 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            {selected.export_count === 0
              ? "No deliveries yet."
              : `${selected.delivered_samples.toLocaleString()} photos delivered across ${selected.export_count} export${selected.export_count === 1 ? "" : "s"}, last on ${fmtDate(selected.last_export_at ?? selected.created_at)}.`}
            {selected.notes ? ` ${selected.notes}` : ""}
          </Typography>
          {lastExport && (
            <Button size="small" startIcon={<HistoryIcon />} onClick={onLoadLast}>
              Same settings as last time
            </Button>
          )}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New buyer</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              helperText="Shown in the zip's folder name and README"
            />
            <TextField
              label="Notes (internal)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={2}
              placeholder="e.g. 1,000 photos / month, contract until Mar 2027"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void create()} disabled={saving || !name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerSection;
