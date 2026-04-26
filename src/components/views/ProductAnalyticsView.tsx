import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Alert } from "@mui/material";
import DateRangePicker from "../productAnalytics/DateRangePicker";
import KpiCards from "../productAnalytics/KpiCards";
import EventTimeSeries from "../productAnalytics/EventTimeSeries";
import FunnelChart from "../productAnalytics/FunnelChart";
import ErrorsTable from "../productAnalytics/ErrorsTable";
import { bqApi, Kpis, toYYYYMMDD } from "../../services/api.bq";

function defaultRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

const ProductAnalyticsView: React.FC = () => {
  const [{ from, to }, setRange] = useState(defaultRange);
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to || from > to) return;
    setKpiLoading(true);
    setKpiError(null);
    bqApi
      .fetchKpis(toYYYYMMDD(from), toYYYYMMDD(to))
      .then(setKpis)
      .catch((e) => setKpiError(e.message))
      .finally(() => setKpiLoading(false));
  }, [from, to]);

  const bqFrom = from ? toYYYYMMDD(from) : "";
  const bqTo = to ? toYYYYMMDD(to) : "";

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ textAlign: "center", mt: { xs: 2, md: 6 }, mb: 3 }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 600, fontSize: { xs: "1.5rem", md: "3.75rem" } }} gutterBottom>
          Product Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, mx: "auto" }}>
          Raw user-behavior events from the PoopCheck mobile app, piped from
          Firebase Analytics into BigQuery. Each event is prefixed <code>pc_</code>.
          Use the date range below to scope every chart on this page.
        </Typography>
      </Box>

      <DateRangePicker
        from={from}
        to={to}
        onFromChange={(v) => setRange((r) => ({ ...r, from: v }))}
        onToChange={(v) => setRange((r) => ({ ...r, to: v }))}
      />

      {kpiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {kpiError}
        </Alert>
      )}

      <KpiCards data={kpis} loading={kpiLoading} />
      <EventTimeSeries from={bqFrom} to={bqTo} />
      <FunnelChart from={bqFrom} to={bqTo} />
      <ErrorsTable from={bqFrom} to={bqTo} />
    </Container>
  );
};

export default ProductAnalyticsView;
