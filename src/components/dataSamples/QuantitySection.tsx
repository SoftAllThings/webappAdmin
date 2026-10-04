import React from "react";
import {
  Box,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Catalog } from "../../services/api.dataSamples";

export type SplitMode = "equal" | "proportional" | "custom";

interface Props {
  bristolTypes: Catalog["bristolTypes"];
  /** Photos still available per type (index 0 = Type 1), or null while loading. */
  available: number[] | null;
  counts: number[];
  total: number;
  mode: SplitMode;
  maxTotal: number;
  onTotalChange: (n: number) => void;
  onModeChange: (m: SplitMode) => void;
  onCountChange: (index: number, n: number) => void;
}

const toInt = (s: string) => {
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};

const QuantitySection: React.FC<Props> = ({
  bristolTypes,
  available,
  counts,
  total,
  mode,
  maxTotal,
  onTotalChange,
  onModeChange,
  onCountChange,
}) => {
  const totalAvailable = available ? available.reduce((a, b) => a + b, 0) : null;

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Total photos"
          value={total === 0 ? "" : String(total)}
          onChange={(e) => onTotalChange(Math.min(toInt(e.target.value), maxTotal))}
          inputProps={{ inputMode: "numeric" }}
          sx={{ width: 160 }}
          helperText={totalAvailable !== null ? `${totalAvailable.toLocaleString()} available` : " "}
        />
        <Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, m: SplitMode | null) => m && onModeChange(m)}
          >
            <ToggleButton value="equal">Equal per type</ToggleButton>
            <ToggleButton value="proportional">Like the source</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {mode === "equal" && "Same number per type; a type that runs out passes its share to the others."}
            {mode === "proportional" && "Keeps the source's own mix of types."}
            {mode === "custom" && "Type the number you want for each type."}
          </Typography>
        </Box>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Bristol type</TableCell>
            <TableCell align="right">Available</TableCell>
            <TableCell align="right" sx={{ width: 130 }}>
              Requested
            </TableCell>
            <TableCell sx={{ width: { xs: 60, sm: 140 } }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {bristolTypes.map((t, i) => {
            const avail = available?.[i];
            const requested = counts[i] ?? 0;
            const over = avail !== undefined && requested > avail;
            return (
              <TableRow key={t.type}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} component="span">
                    {t.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                    {t.description}
                  </Typography>
                </TableCell>
                <TableCell align="right">{avail === undefined ? "…" : avail.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    value={String(requested)}
                    onChange={(e) => onCountChange(i, toInt(e.target.value))}
                    error={over}
                    inputProps={{ inputMode: "numeric", style: { textAlign: "right", padding: "6px 8px" } }}
                    sx={{ width: 100 }}
                  />
                  {over && (
                    <Typography variant="caption" color="error" sx={{ display: "block" }}>
                      only {avail!.toLocaleString()}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <LinearProgress
                    variant="determinate"
                    color={over ? "error" : "primary"}
                    value={avail ? Math.min(100, (requested / avail) * 100) : 0}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
            <TableCell align="right">{totalAvailable === null ? "…" : totalAvailable.toLocaleString()}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>
              {counts.reduce((a, b) => a + b, 0).toLocaleString()}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};

export default QuantitySection;
