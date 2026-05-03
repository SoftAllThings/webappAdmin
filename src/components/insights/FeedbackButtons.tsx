import React, {useState} from "react";
import {ButtonGroup, Button, Snackbar, Alert} from "@mui/material";
import {
  ThumbUpAltOutlined,
  ThumbDownAltOutlined,
  ReportProblemOutlined,
} from "@mui/icons-material";
import {insightsApi} from "../../services/api.insights";
import type {Period, SectionId, FeedbackVerdict} from "../../types/insights";

interface Props {
  briefDate: string;
  briefPeriod: Period;
  sectionId: SectionId;
}

const FeedbackButtons: React.FC<Props> = ({briefDate, briefPeriod, sectionId}) => {
  const [submitted, setSubmitted] = useState<FeedbackVerdict | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (verdict: FeedbackVerdict) => {
    setBusy(true);
    setError(null);
    try {
      await insightsApi.submitFeedback({briefDate, briefPeriod, sectionId, verdict});
      setSubmitted(verdict);
      setToast(
        verdict === "useful" ? "Marked useful" : verdict === "noise" ? "Marked noise" : "Marked wrong",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit feedback");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ButtonGroup size="small" disabled={busy} variant="outlined">
        <Button
          onClick={() => handle("useful")}
          color={submitted === "useful" ? "success" : "inherit"}
          startIcon={<ThumbUpAltOutlined />}
        >
          Useful
        </Button>
        <Button
          onClick={() => handle("noise")}
          color={submitted === "noise" ? "warning" : "inherit"}
          startIcon={<ThumbDownAltOutlined />}
        >
          Noise
        </Button>
        <Button
          onClick={() => handle("wrong")}
          color={submitted === "wrong" ? "error" : "inherit"}
          startIcon={<ReportProblemOutlined />}
        >
          Wrong
        </Button>
      </ButtonGroup>
      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={() => setToast(null)}
        message={toast ?? ""}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedbackButtons;
