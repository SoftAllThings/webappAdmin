import React, {useState} from "react";
import {
  Box,
  Stack,
  Typography,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import {ExpandMore, ExpandLess} from "@mui/icons-material";
import EvidencePanel from "./EvidencePanel";
import type {DiscussionItem} from "../../types/insights";

interface Props {
  items: DiscussionItem[];
}

const Label: React.FC<{label: string}> = ({label}) => (
  <Typography
    variant="overline"
    color="text.secondary"
    sx={{letterSpacing: 1.2, display: "block", mb: 0.5, fontSize: "0.65rem"}}
  >
    {label}
  </Typography>
);

const DiscussionItemCard: React.FC<{item: DiscussionItem; index: number}> = ({
  item,
  index,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: "rgba(252, 255, 89, 0.04)",
        border: "1px solid rgba(252, 255, 89, 0.18)",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "rgba(252,255,89,0.9)",
            minWidth: 18,
          }}
        >
          {index + 1}.
        </Typography>
        <Typography variant="body1" sx={{flex: 1, fontWeight: 500, lineHeight: 1.4}}>
          {item.question}
        </Typography>
        <IconButton size="small" onClick={() => setOpen((v) => !v)}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Stack>
      <Collapse in={open}>
        <Stack spacing={1.5} sx={{mt: 2, pl: 3}}>
          <Box>
            <Label label="What the data says" />
            <Typography variant="body2">{item.agentRead}</Typography>
          </Box>
          <Divider sx={{borderColor: "rgba(255,255,255,0.06)"}} />
          <Box>
            <Label label="Recommendation" />
            <Typography variant="body2">{item.recommendation}</Typography>
          </Box>
          <Divider sx={{borderColor: "rgba(255,255,255,0.06)"}} />
          <Box>
            <Label label="What would change my mind" />
            <Typography variant="body2" color="text.secondary" sx={{fontStyle: "italic"}}>
              {item.whatWouldChangeMyMind}
            </Typography>
          </Box>
          {item.evidence && item.evidence.length > 0 && (
            <EvidencePanel evidence={item.evidence} />
          )}
        </Stack>
      </Collapse>
    </Box>
  );
};

const DiscussionSection: React.FC<Props> = ({items}) => {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No discussion items.
      </Typography>
    );
  }
  return (
    <Stack spacing={1.5}>
      {items.map((it, i) => (
        <DiscussionItemCard key={i} item={it} index={i} />
      ))}
    </Stack>
  );
};

export default DiscussionSection;
