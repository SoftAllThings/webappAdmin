import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { FieldDef, GroupDef } from "../../services/api.dataSamples";

interface Props {
  groups: GroupDef[];
  /** Fields that exist for the selected source, in catalog order. */
  fields: FieldDef[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

function tooltip(f: FieldDef): string {
  const values = f.values ? `\nValues: ${f.values.join(", ")}` : "";
  return `${f.group}.${f.name} — ${f.description}${values}`;
}

const FieldPicker: React.FC<Props> = ({ groups, fields, selected, onChange }) => {
  const setMany = (ids: string[], on: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onChange(next);
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => onChange(new Set(fields.filter((f) => f.defaultOn).map((f) => f.id)))}>
          Defaults
        </Button>
        <Button size="small" onClick={() => onChange(new Set(fields.map((f) => f.id)))}>
          All
        </Button>
        <Button size="small" onClick={() => onChange(new Set())}>
          None
        </Button>
      </Stack>

      {groups.map((g) => {
        const groupFields = fields.filter((f) => f.group === g.key);
        if (groupFields.length === 0) return null;
        const ids = groupFields.map((f) => f.id);
        const on = ids.filter((id) => selected.has(id)).length;

        return (
          <Paper key={g.key} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={on > 0}
                onChange={(e) => setMany(ids, e.target.checked)}
                inputProps={{ "aria-label": `Include ${g.title}` }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">
                  {g.title}{" "}
                  <Typography component="span" variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                    {g.key}
                  </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {g.description}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                {on}/{ids.length}
              </Typography>
            </Stack>

            {g.warning && on > 0 && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                {g.warning}
              </Alert>
            )}

            <Box
              sx={{
                display: "grid",
                // Fit as many columns as the pane allows (it shares the row with the preview).
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                columnGap: 1,
                mt: 0.5,
                pl: { sm: 1 },
              }}
            >
              {groupFields.map((f) => (
                <Tooltip key={f.id} title={<span style={{ whiteSpace: "pre-line" }}>{tooltip(f)}</span>} placement="top-start">
                  <FormControlLabel
                    sx={{ mr: 0 }}
                    control={
                      <Checkbox size="small" checked={selected.has(f.id)} onChange={(e) => setMany([f.id], e.target.checked)} />
                    }
                    label={<Typography variant="body2">{f.title}</Typography>}
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default FieldPicker;
