import React, {useState} from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import {ExpandMore, Code as CodeIcon} from "@mui/icons-material";
import type {Evidence} from "../../types/insights";

interface Props {
  evidence: Evidence[];
}

const EvidencePanel: React.FC<Props> = ({evidence}) => {
  const [expanded, setExpanded] = useState(false);
  if (!evidence || evidence.length === 0) return null;
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, v) => setExpanded(v)}
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        "&:before": {display: "none"},
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <CodeIcon fontSize="small" color="disabled" />
          <Typography variant="body2" color="text.secondary">
            {evidence.length} evidence {evidence.length === 1 ? "entry" : "entries"}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {evidence.map((e, i) => (
            <Box key={i} sx={{borderLeft: "2px solid rgba(155,240,255,0.4)", pl: 2}}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 0.5}}>
                <Chip size="small" label={e.tool} sx={{fontFamily: "monospace"}} />
                <Typography variant="caption" color="text.secondary">
                  args: {Object.keys(e.args || {}).join(", ") || "—"}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{mb: 0.5}}>
                {e.resultSummary}
              </Typography>
              <Box
                component="pre"
                sx={{
                  fontSize: "0.72rem",
                  bgcolor: "rgba(0,0,0,0.3)",
                  p: 1,
                  borderRadius: 1,
                  overflow: "auto",
                  maxHeight: 200,
                  m: 0,
                  color: "text.secondary",
                }}
              >
                {(() => {
                  try {
                    return JSON.stringify(e.resultData, null, 2);
                  } catch {
                    return String(e.resultData);
                  }
                })()}
              </Box>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default EvidencePanel;
