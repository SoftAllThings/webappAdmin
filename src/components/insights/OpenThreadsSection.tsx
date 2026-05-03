import React, {useState} from "react";
import {Stack, Typography, Chip, Box, Button, Collapse} from "@mui/material";
import type {OpenThread} from "../../types/insights";

interface Props {
  threads: OpenThread[];
}

const STATUS_COLOR: Record<string, "default" | "warning" | "error" | "success"> = {
  watching: "default",
  resolved: "success",
  escalated: "error",
};

const ThreadRow: React.FC<{thread: OpenThread}> = ({thread}) => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 1,
      bgcolor: "rgba(255,255,255,0.03)",
      borderLeft: "3px solid",
      borderColor:
        thread.status === "escalated"
          ? "error.main"
          : thread.status === "resolved"
            ? "success.main"
            : "info.main",
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{mb: 0.5}}>
      <Chip
        size="small"
        label={thread.status}
        color={STATUS_COLOR[thread.status] ?? "default"}
        sx={{height: 18, fontSize: "0.65rem"}}
      />
      <Typography variant="caption" color="text.secondary">
        first seen {thread.firstSeen}
      </Typography>
    </Stack>
    <Typography variant="body2">{thread.topic}</Typography>
  </Box>
);

const OpenThreadsSection: React.FC<Props> = ({threads}) => {
  const [showAll, setShowAll] = useState(false);
  if (!threads || threads.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No open threads.
      </Typography>
    );
  }
  const escalated = threads.filter((t) => t.status === "escalated");
  const others = threads.filter((t) => t.status !== "escalated");
  const showOthers = showAll || escalated.length === 0;

  return (
    <Stack spacing={1}>
      {escalated.map((t) => (
        <ThreadRow key={t.id} thread={t} />
      ))}
      <Collapse in={showOthers}>
        <Stack spacing={1}>
          {others.map((t) => (
            <ThreadRow key={t.id} thread={t} />
          ))}
        </Stack>
      </Collapse>
      {others.length > 0 && (
        <Button
          size="small"
          onClick={() => setShowAll((v) => !v)}
          sx={{alignSelf: "flex-start", textTransform: "none"}}
        >
          {showOthers ? "Hide" : `Show ${others.length} more`}
        </Button>
      )}
    </Stack>
  );
};

export default OpenThreadsSection;
