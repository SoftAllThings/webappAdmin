import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Block as VoidIcon,
  Download as DownloadIcon,
  Replay as ReuseIcon,
} from "@mui/icons-material";
import { ExportStatus, SampleExport, SourceDef } from "../../services/api.dataSamples";

interface Props {
  exports: SampleExport[];
  sources: SourceDef[];
  loading: boolean;
  busyId: string | null;
  onDownload: (e: SampleExport) => void;
  onVoid: (e: SampleExport) => void;
  onReuse: (e: SampleExport) => void;
}

const STATUS: Record<ExportStatus, { label: string; color: "success" | "warning" | "default"; help: string }> = {
  delivered: {
    label: "Delivered",
    color: "success",
    help: "The zip was downloaded in full. These photos won't be offered to this buyer again.",
  },
  prepared: {
    label: "Prepared",
    color: "warning",
    help: "Photos are reserved for this buyer but the zip hasn't been downloaded in full yet. Download it, or void it to release the photos.",
  },
  voided: {
    label: "Voided",
    color: "default",
    help: "Never sent. Its photos are available again.",
  },
};

const fmt = (s: string) =>
  new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const ExportHistory: React.FC<Props> = ({ exports, sources, loading, busyId, onDownload, onVoid, onReuse }) => {
  if (loading && exports.length === 0) return <CircularProgress size={20} />;
  if (exports.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nothing sent to this buyer yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Prepared</TableCell>
            <TableCell>Source</TableCell>
            <TableCell align="right">Photos</TableCell>
            <TableCell>Per type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {exports.map((e) => {
            const status = STATUS[e.status];
            const busy = busyId === e.id;
            const perType = e.per_type ?? {};
            return (
              <TableRow key={e.id} sx={{ opacity: e.status === "voided" ? 0.5 : 1 }}>
                <TableCell>
                  {fmt(e.created_at)}
                  {e.created_by && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      by {e.created_by}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{sources.find((s) => s.key === e.source)?.title ?? e.source}</TableCell>
                <TableCell align="right">
                  {(e.delivered_count ?? e.prepared_count).toLocaleString()}
                  {e.prepared_count < e.requested_count && (
                    <Typography variant="caption" color="warning.main" sx={{ display: "block" }}>
                      asked {e.requested_count.toLocaleString()}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                    {Object.keys(perType)
                      .sort()
                      .map((t) => `T${t}:${perType[t]}`)
                      .join(" ")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={status.help}>
                    <Chip size="small" label={status.label} color={status.color} variant="outlined" />
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0} justifyContent="flex-end">
                    <Tooltip title="Use these settings">
                      <IconButton size="small" onClick={() => onReuse(e)}>
                        <ReuseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {e.status !== "voided" && (
                      <>
                        <Tooltip title={e.status === "delivered" ? "Download again (same photos)" : "Download zip"}>
                          <span>
                            <IconButton size="small" disabled={busy} onClick={() => onDownload(e)}>
                              {busy ? <CircularProgress size={16} /> : <DownloadIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Void — this was never sent; release its photos">
                          <span>
                            <IconButton size="small" disabled={busy} onClick={() => onVoid(e)}>
                              <VoidIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ExportHistory;
