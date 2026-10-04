import React, { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { PersonDelivery, dataSamplesApi } from "../../services/api.dataSamples";

/** Deletion / access requests: which buyers already received this person's photos. */
const PersonLookup: React.FC = () => {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ uid: string; deliveries: PersonDelivery[] } | null>(null);

  const search = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await dataSamplesApi.lookup(q.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  };

  const live = result?.deliveries.filter((d) => d.status !== "voided") ?? [];

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <TextField
          size="small"
          fullWidth
          label="Firebase uid or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && void search()}
        />
        <Button variant="outlined" startIcon={<SearchIcon />} disabled={!q.trim() || busy} onClick={() => void search()}>
          Look up
        </Button>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {result && (
        <Alert severity={live.length ? "warning" : "success"} sx={{ mt: 1 }}>
          {live.length === 0 ? (
            <>No buyer has received photos from {result.uid}.</>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {result.uid} appears in {live.length} export{live.length === 1 ? "" : "s"}:
              </Typography>
              {live.map((d) => (
                <Typography key={d.export_id} variant="body2">
                  • {d.buyer_name} — {d.samples} photo{d.samples === 1 ? "" : "s"},{" "}
                  {new Date(d.created_at).toLocaleDateString()} ({d.status})
                </Typography>
              ))}
            </>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default PersonLookup;
