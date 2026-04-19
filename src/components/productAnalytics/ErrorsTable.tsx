import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { bqApi, ErrorRow } from "../../services/api.bq";
import { getEventLabel, getEventDescription } from "./eventsMetadata";

type Props = { from: string; to: string };

const ErrorsTable: React.FC<Props> = ({ from, to }) => {
  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    bqApi
      .fetchErrors(from, to)
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Friction / error events</Typography>
        <Typography variant="body2" color="text.secondary">
          Every event prefixed <code>pc_err_*</code> that fired in this range.
          Sorted by frequency. High counts here are the best hints about where
          users are getting stuck.
        </Typography>
      </Box>

      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : rows.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "grey.50",
            border: 1,
            borderColor: "grey.200",
            borderRadius: 1,
          }}
        >
          <Typography color="text.secondary">
            🎉 No error events fired in this range.
          </Typography>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell align="right">Total fires</TableCell>
              <TableCell align="right">Unique users affected</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const label = getEventLabel(r.event_name);
              const desc = getEventDescription(r.event_name);
              return (
                <TableRow key={r.event_name} hover>
                  <TableCell>
                    <Tooltip title={desc || r.event_name} arrow placement="top">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {label}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {r.event_name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{r.count.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {r.uniqueUsers.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default ErrorsTable;
