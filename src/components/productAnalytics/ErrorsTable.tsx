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
} from "@mui/material";
import { bqApi, ErrorRow } from "../../services/api.bq";

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
      <Typography variant="h6" sx={{ mb: 2 }}>
        Errors (pc_err_*)
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography color="text.secondary">No errors in this range.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="right">Unique users</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.event_name}>
                <TableCell>{r.event_name}</TableCell>
                <TableCell align="right">{r.count.toLocaleString()}</TableCell>
                <TableCell align="right">{r.uniqueUsers.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default ErrorsTable;
