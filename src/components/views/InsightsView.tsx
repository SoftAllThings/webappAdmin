import React, {useEffect, useState} from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  Collapse,
  Button,
} from "@mui/material";
import {ExpandMore, ExpandLess} from "@mui/icons-material";
import {insightsApi, BriefSummary} from "../../services/api.insights";
import type {Brief, Period} from "../../types/insights";
import SectionCard from "../insights/SectionCard";
import DiscussionSection from "../insights/DiscussionSection";
import OpenThreadsSection from "../insights/OpenThreadsSection";

const SUPPORTED_PERIODS: Period[] = ["weekly", "monthly"];

/** Sections the meeting reader sees prominently. Discussion + open_threads have custom renderers. */
const PROMINENT_IDS = new Set([
  "revenue",
  "acquisition",
  "engagement",
  "retention",
  "feature_usage",
  "anomalies",
]);

const InsightsView: React.FC = () => {
  const [period, setPeriod] = useState<Period>("weekly");
  const [briefs, setBriefs] = useState<BriefSummary[]>([]);
  const [briefsLoading, setBriefsLoading] = useState(false);
  const [briefsError, setBriefsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [showQuiet, setShowQuiet] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBriefsLoading(true);
    setBriefsError(null);
    setSelectedDate(null);
    setBrief(null);
    insightsApi
      .listBriefs(period, 12)
      .then((list) => {
        if (cancelled) return;
        setBriefs(list);
        const first = list[0];
        if (first) setSelectedDate(first.date);
      })
      .catch((e) => {
        if (cancelled) return;
        setBriefsError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setBriefsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  useEffect(() => {
    if (!selectedDate) {
      setBrief(null);
      return;
    }
    let cancelled = false;
    setBriefLoading(true);
    setBriefError(null);
    insightsApi
      .getBrief(period, selectedDate)
      .then((b) => {
        if (!cancelled) setBrief(b);
      })
      .catch((e) => {
        if (!cancelled) setBriefError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setBriefLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, selectedDate]);

  const tldr = brief?.sections.find((s) => s.id === "tldr") ?? null;
  const discussion = brief?.sections.find((s) => s.id === "discussion") ?? null;
  const openThreads = brief?.sections.find((s) => s.id === "open_threads") ?? null;

  const prominentSections =
    brief?.sections.filter((s) => PROMINENT_IDS.has(s.id)) ?? [];
  const movedSections = prominentSections.filter((s) => s.status === "filled");
  const quietSections = prominentSections.filter((s) => s.status !== "filled");

  return (
    <Container maxWidth="md" sx={{py: {xs: 2, md: 4}}}>
      <Box sx={{textAlign: "center", mt: {xs: 2, md: 4}, mb: 3}}>
        <Typography
          variant="h2"
          component="h1"
          sx={{fontWeight: 600, fontSize: {xs: "1.5rem", md: "2.5rem"}}}
          gutterBottom
        >
          Meeting Brief
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{maxWidth: 600, mx: "auto"}}>
          The one thing that mattered, what to do about it.
          Tap any card for the details.
        </Typography>
      </Box>

      <Stack
        direction={{xs: "column", sm: "row"}}
        spacing={2}
        alignItems={{xs: "stretch", sm: "center"}}
        justifyContent="space-between"
        sx={{mb: 3}}
      >
        <Tabs
          value={period}
          onChange={(_, v) => setPeriod(v as Period)}
          textColor="primary"
          indicatorColor="primary"
        >
          {SUPPORTED_PERIODS.map((p) => (
            <Tab key={p} value={p} label={p.charAt(0).toUpperCase() + p.slice(1)} />
          ))}
        </Tabs>
        <FormControl size="small" sx={{minWidth: 220}}>
          <InputLabel>Brief date</InputLabel>
          <Select
            label="Brief date"
            value={selectedDate ?? ""}
            onChange={(e) => setSelectedDate((e.target.value as string) || null)}
            disabled={briefsLoading || briefs.length === 0}
          >
            {briefs.map((b) => (
              <MenuItem key={b.date} value={b.date}>
                {b.date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {briefsError && (
        <Alert severity="error" sx={{mb: 3}}>
          {briefsError}
        </Alert>
      )}
      {briefsLoading && briefs.length === 0 && (
        <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
          <CircularProgress size={24} />
        </Box>
      )}
      {!briefsLoading && briefs.length === 0 && !briefsError && (
        <Alert severity="info">
          No {period} briefs yet.
        </Alert>
      )}

      {briefError && (
        <Alert severity="error" sx={{mb: 3}}>
          {briefError}
        </Alert>
      )}
      {briefLoading && (
        <Box sx={{display: "flex", justifyContent: "center", py: 6}}>
          <CircularProgress size={24} />
        </Box>
      )}

      {brief && !briefLoading && (
        <Box>
          {/* TL;DR — hero card */}
          {tldr && (
            <Card
              elevation={0}
              sx={{
                mb: 3,
                bgcolor: "rgba(155, 240, 255, 0.04)",
                border: "1px solid rgba(155, 240, 255, 0.25)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{letterSpacing: 1.5, fontSize: "0.7rem"}}
                >
                  This week in one sentence
                </Typography>
                <Typography variant="h5" sx={{fontWeight: 600, lineHeight: 1.3, mt: 0.5}}>
                  {tldr.headline}
                </Typography>
                {tldr.narrative && (
                  <Typography variant="body2" color="text.secondary" sx={{mt: 1.5}}>
                    {tldr.narrative}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sections that moved */}
          {movedSections.length > 0 && (
            <Box sx={{mb: 2}}>
              {movedSections.map((s) => (
                <SectionCard
                  key={s.id}
                  section={s}
                  briefDate={brief.date}
                  briefPeriod={brief.period}
                />
              ))}
            </Box>
          )}

          {/* Quiet sections — collapsed group */}
          {quietSections.length > 0 && (
            <Box sx={{mb: 3}}>
              <Button
                size="small"
                startIcon={showQuiet ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setShowQuiet((v) => !v)}
                sx={{textTransform: "none", color: "text.secondary"}}
              >
                {quietSections.length} section{quietSections.length === 1 ? "" : "s"} quiet —{" "}
                {quietSections.map((s) => s.title.toLowerCase()).join(", ")}
              </Button>
              <Collapse in={showQuiet}>
                <Box sx={{mt: 1.5}}>
                  {quietSections.map((s) => (
                    <SectionCard
                      key={s.id}
                      section={s}
                      briefDate={brief.date}
                      briefPeriod={brief.period}
                    />
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Discussion — questions for the meeting */}
          {discussion && (
            <Box sx={{mt: 4, mb: 2}}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{letterSpacing: 1.5, fontSize: "0.75rem", display: "block", mb: 1.5}}
              >
                What to discuss
              </Typography>
              <DiscussionSection items={brief.discussion ?? []} />
            </Box>
          )}

          {/* Open threads — only if there are any */}
          {openThreads && (brief.openThreads?.length ?? 0) > 0 && (
            <Box sx={{mt: 4, mb: 2}}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{letterSpacing: 1.5, fontSize: "0.75rem", display: "block", mb: 1.5}}
              >
                Tracking
              </Typography>
              <OpenThreadsSection threads={brief.openThreads ?? []} />
            </Box>
          )}

          <Box sx={{mt: 4, textAlign: "center"}}>
            <Typography variant="caption" color="text.secondary">
              {brief.period} brief · {brief.date} · run {brief.modelRunId}
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default InsightsView;
