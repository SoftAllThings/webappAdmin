import React, {useState} from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Box,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import {ExpandMore, ExpandLess} from "@mui/icons-material";
import type {ReportSection, Period} from "../../types/insights";
import EvidencePanel from "./EvidencePanel";
import FeedbackButtons from "./FeedbackButtons";

interface Props {
  section: ReportSection;
  briefDate: string;
  briefPeriod: Period;
  /** Optional override for non-generic sections that render their own body. */
  children?: React.ReactNode;
  /** When true, body is shown by default (TL;DR, hero sections). */
  defaultExpanded?: boolean;
  /** Hide the per-section feedback buttons (when shown elsewhere). */
  hideFeedback?: boolean;
}

const STATUS_COLOR: Record<string, "default" | "info" | "warning"> = {
  filled: "default",
  no_change: "info",
  insufficient_data: "warning",
};

const SEVERITY_COLOR: Record<string, "info" | "warning" | "error"> = {
  info: "info",
  watch: "warning",
  concern: "error",
};

const SectionCard: React.FC<Props> = ({
  section,
  briefDate,
  briefPeriod,
  children,
  defaultExpanded = false,
  hideFeedback = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // For compact view, only show concern callouts inline; rest hidden behind expand.
  const visibleCallouts = section.callouts?.filter((c) => c.severity === "concern") ?? [];
  const hiddenCallouts = section.callouts?.filter((c) => c.severity !== "concern") ?? [];
  const hasMore =
    !!section.narrative ||
    hiddenCallouts.length > 0 ||
    (section.evidence?.length ?? 0) > 0 ||
    !!children ||
    (section.charts?.length ?? 0) > 0 ||
    (section.drillInLinks?.length ?? 0) > 0;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        bgcolor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{pb: hasMore ? 1 : 2, "&:last-child": {pb: hasMore ? 1 : 2}}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.25} sx={{flex: 1, minWidth: 0}}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{letterSpacing: 1.2, fontSize: "0.7rem"}}
              >
                {section.title}
              </Typography>
              {section.status !== "filled" && (
                <Chip
                  size="small"
                  label={section.status === "no_change" ? "quiet" : section.status.replace(/_/g, " ")}
                  color={STATUS_COLOR[section.status] ?? "default"}
                  sx={{height: 18, fontSize: "0.65rem"}}
                />
              )}
            </Stack>
            <Typography variant="h6" sx={{fontWeight: 600, lineHeight: 1.3}}>
              {section.headline}
            </Typography>
          </Stack>
          {hasMore && (
            <IconButton
              size="small"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
        </Stack>

        {visibleCallouts.length > 0 && (
          <Stack spacing={0.75} sx={{mt: 1.5}}>
            {visibleCallouts.map((c, i) => (
              <Stack
                key={i}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: "rgba(244,67,54,0.06)",
                  borderLeft: "3px solid",
                  borderColor: "error.main",
                }}
              >
                <Typography variant="body2" sx={{flex: 1, fontWeight: 500}}>
                  {c.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        <Collapse in={expanded}>
          <Box sx={{mt: 2}}>
            {children ? (
              children
            ) : (
              <>
                {section.narrative && (
                  <Typography variant="body2" sx={{mb: 1.5, whiteSpace: "pre-wrap", color: "text.primary"}}>
                    {section.narrative}
                  </Typography>
                )}
                {hiddenCallouts.length > 0 && (
                  <Stack spacing={0.75} sx={{mb: 1.5}}>
                    {hiddenCallouts.map((c, i) => (
                      <Stack
                        key={i}
                        direction="row"
                        spacing={1}
                        alignItems="flex-start"
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "rgba(255,255,255,0.03)",
                          borderLeft: "3px solid",
                          borderColor: `${SEVERITY_COLOR[c.severity] ?? "info"}.main`,
                        }}
                      >
                        <Chip
                          size="small"
                          label={c.severity}
                          color={SEVERITY_COLOR[c.severity] ?? "info"}
                          variant="outlined"
                          sx={{height: 18, fontSize: "0.65rem"}}
                        />
                        <Typography variant="body2" sx={{flex: 1, color: "text.secondary"}}>
                          {c.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </>
            )}

            {section.drillInLinks && section.drillInLinks.length > 0 && (
              <Stack direction="row" spacing={1} sx={{mt: 1.5}} flexWrap="wrap">
                {section.drillInLinks.map((l, i) => (
                  <Button key={i} size="small" variant="outlined" href={l.path}>
                    {l.label}
                  </Button>
                ))}
              </Stack>
            )}

            {section.evidence && section.evidence.length > 0 && (
              <Box sx={{mt: 1.5}}>
                <EvidencePanel evidence={section.evidence} />
              </Box>
            )}

            {!hideFeedback && (
              <Stack direction="row" justifyContent="flex-end" sx={{mt: 1.5}}>
                <FeedbackButtons
                  briefDate={briefDate}
                  briefPeriod={briefPeriod}
                  sectionId={section.id}
                />
              </Stack>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default SectionCard;
