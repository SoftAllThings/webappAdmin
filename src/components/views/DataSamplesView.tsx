import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Inventory2 as PrepareIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Availability,
  Buyer,
  Catalog,
  ExportConfig,
  OptionKey,
  SampleExport,
  SampleOptions,
  SourceKey,
  dataSamplesApi,
} from "../../services/api.dataSamples";
import { splitEqual, splitProportional } from "../../utils/sampleSplit";
import BuyerSection from "../dataSamples/BuyerSection";
import SourcePicker from "../dataSamples/SourcePicker";
import QuantitySection, { SplitMode } from "../dataSamples/QuantitySection";
import FieldPicker from "../dataSamples/FieldPicker";
import JsonPreview from "../dataSamples/JsonPreview";
import FolderTree from "../dataSamples/FolderTree";
import ExportHistory from "../dataSamples/ExportHistory";
import PersonLookup from "../dataSamples/PersonLookup";

const OPTION_TEXT: Record<OptionKey, { label: string; help: string }> = {
  excludeSentToBuyer: {
    label: "Skip photos this buyer already has",
    help: "Keeps monthly deliveries free of repeats.",
  },
  excludeSentToAnyBuyer: {
    label: "Skip photos any buyer already has",
    help: "For exclusive deals: only photos never sold to anyone.",
  },
  includeRejected: {
    label: "Include photos reviewers rejected",
    help: "~15k photos marked not usable for training in AI Review.",
  },
  includeWebDemo: {
    label: "Include website demo uploads",
    help: "~3.3k anonymous uploads from the website demo: no user, no profile, nobody vetted them.",
  },
  includeMinors: {
    label: "Include users whose profile says Under 18",
    help: "Health data about minors. Leave off unless the buyer agreement and the users' consent clearly cover it.",
  },
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

function fmtBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${Math.round(n / 1e6)} MB`;
  return `${Math.max(1, Math.round(n / 1e3))} KB`;
}

function defaultFields(catalog: Catalog): Record<SourceKey, Set<string>> {
  const pick = (s: SourceKey) =>
    new Set(catalog.fields.filter((f) => f.defaultOn && f.sources.includes(s)).map((f) => f.id));
  return { ready_to_train: pick("ready_to_train"), app_poop: pick("app_poop"), stool_logs: pick("stool_logs") };
}

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
    <Stack direction="row" alignItems="center" sx={{ mb: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Paper>
);

const DataSamplesView: React.FC = () => {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyersError, setBuyersError] = useState<string | null>(null);
  const [buyerId, setBuyerId] = useState<number | null>(null);

  const [source, setSource] = useState<SourceKey>("ready_to_train");
  const [options, setOptions] = useState<SampleOptions | null>(null);
  const [fieldsBySource, setFieldsBySource] = useState<Record<SourceKey, Set<string>> | null>(null);

  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [mode, setMode] = useState<SplitMode>("equal");
  const [total, setTotal] = useState(700);
  const [counts, setCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const [history, setHistory] = useState<SampleExport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [preparing, setPreparing] = useState(false);
  const [prepared, setPrepared] = useState<SampleExport | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Live preview: one real record (all fields of the source); ticking fields
  // only filters it client-side, so toggles update instantly.
  const [previewRecord, setPreviewRecord] = useState<Record<string, unknown> | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [flash, setFlash] = useState<{ ids: Set<string>; key: number }>({ ids: new Set(), key: 0 });

  // ------------------------------------------------------------- loading

  const loadBuyers = useCallback(async () => {
    try {
      setBuyers(await dataSamplesApi.buyers());
      setBuyersError(null);
    } catch (e) {
      setBuyersError(message(e));
    }
  }, []);

  useEffect(() => {
    dataSamplesApi
      .catalog()
      .then((c) => {
        setCatalog(c);
        setOptions(c.defaultOptions);
        setFieldsBySource(defaultFields(c));
      })
      .catch((e) => setLoadError(message(e)));
    void loadBuyers();
  }, [loadBuyers]);

  const loadHistory = useCallback(async (id: number) => {
    setHistoryLoading(true);
    try {
      setHistory(await dataSamplesApi.exports(id));
    } catch (e) {
      setActionError(message(e));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    setPrepared(null);
    setHistory([]);
    if (buyerId !== null) void loadHistory(buyerId);
  }, [buyerId, loadHistory]);

  // What's left to sample — depends on source, buyer (already-sent) and filters.
  useEffect(() => {
    if (!catalog || !options) return;
    let cancelled = false;
    setAvailability(null);
    const timer = setTimeout(() => {
      dataSamplesApi
        .availability(source, buyerId, options)
        .then((a) => {
          if (cancelled) return;
          setAvailability(a);
          setAvailabilityError(null);
        })
        .catch((e) => !cancelled && setAvailabilityError(message(e)));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [catalog, source, buyerId, options, refreshKey]);

  useEffect(() => {
    if (!catalog || !options) return;
    let cancelled = false;
    setPreviewLoading(true);
    const timer = setTimeout(() => {
      dataSamplesApi
        .preview(source, options)
        .then(({ record }) => {
          if (cancelled) return;
          setPreviewRecord(record);
          setPreviewNote(null);
        })
        .catch((e) => {
          if (cancelled) return;
          setPreviewRecord(null);
          setPreviewNote(message(e));
        })
        .finally(() => !cancelled && setPreviewLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [catalog, source, options, previewNonce]);

  // A record from another source has other groups — never show it under this one.
  useEffect(() => setPreviewRecord(null), [source]);

  const available = useMemo(() => availability?.perType.map((t) => t.available) ?? null, [availability]);

  useEffect(() => {
    if (mode === "custom" || !available) return;
    setCounts(mode === "equal" ? splitEqual(total, available) : splitProportional(total, available));
  }, [mode, total, available]);

  // ------------------------------------------------------------- derived

  const sourceDef = catalog?.sources.find((s) => s.key === source) ?? null;
  const buyer = buyers.find((b) => b.id === buyerId) ?? null;
  const sourceFields = useMemo(
    () => (catalog ? catalog.fields.filter((f) => f.sources.includes(source)) : []),
    [catalog, source],
  );
  const selected = useMemo(() => fieldsBySource?.[source] ?? new Set<string>(), [fieldsBySource, source]);
  const selectedFields = useMemo(() => sourceFields.filter((f) => selected.has(f.id)), [sourceFields, selected]);
  const requested = sum(counts);
  const lastExport = history.find((e) => e.status !== "voided") ?? null;

  const problems: string[] = [];
  if (!buyerId) problems.push("Pick or create a buyer.");
  if (requested === 0) problems.push("Ask for at least one photo.");
  if (catalog && requested > catalog.maxSamplesPerExport) {
    problems.push(`At most ${catalog.maxSamplesPerExport.toLocaleString()} photos per export.`);
  }
  counts.forEach((n, i) => {
    const a = available?.[i];
    if (a !== undefined && n > a) problems.push(`Type ${i + 1}: only ${a.toLocaleString()} available.`);
  });
  const canPrepare = problems.length === 0 && available !== null && !preparing;

  // ------------------------------------------------------------- actions

  const changeFields = (next: Set<string>) => {
    // Flash what was just switched on, so each toggle's effect is visible.
    setFlash({ ids: new Set(Array.from(next).filter((id) => !selected.has(id))), key: Date.now() });
    setFieldsBySource((prev) => (prev ? { ...prev, [source]: next } : prev));
  };

  const refreshAfterChange = () => {
    setRefreshKey((k) => k + 1);
    void loadBuyers();
    if (buyerId !== null) void loadHistory(buyerId);
  };

  const applyConfig = (config: ExportConfig) => {
    if (!catalog) return;
    const restored = [1, 2, 3, 4, 5, 6, 7].map((t) => config.counts[String(t)] ?? 0);
    setSource(config.source);
    setOptions({ ...catalog.defaultOptions, ...config.options });
    setFieldsBySource((prev) => (prev ? { ...prev, [config.source]: new Set(config.fields) } : prev));
    setMode("custom");
    setCounts(restored);
    setTotal(sum(restored));
    setPrepared(null);
  };

  const prepare = async () => {
    if (buyerId === null || !options) return;
    setPreparing(true);
    setActionError(null);
    setPrepared(null);
    const byType: Record<string, number> = {};
    counts.forEach((n, i) => (byType[String(i + 1)] = n));
    try {
      const exp = await dataSamplesApi.prepare(buyerId, {
        source,
        counts: byType,
        fields: Array.from(selected),
        options,
      });
      setPrepared(exp);
      refreshAfterChange();
    } catch (e) {
      setActionError(message(e));
    } finally {
      setPreparing(false);
    }
  };

  const download = async (exp: SampleExport) => {
    setBusyId(exp.id);
    setActionError(null);
    try {
      await dataSamplesApi.download(exp.id);
      // Status flips to "delivered" only once the whole zip has streamed.
      if (buyerId !== null) setTimeout(() => void loadHistory(buyerId), 5000);
    } catch (e) {
      setActionError(message(e));
    } finally {
      setBusyId(null);
    }
  };

  const voidExport = async (exp: SampleExport) => {
    const ok = window.confirm(
      `Void this export of ${exp.prepared_count.toLocaleString()} photos?\n\n` +
        `Only do this if it was never sent to ${buyer?.name ?? "the buyer"}: its photos become available again for everyone.`,
    );
    if (!ok) return;
    setBusyId(exp.id);
    setActionError(null);
    try {
      await dataSamplesApi.voidExport(exp.id);
      if (prepared?.id === exp.id) setPrepared(null);
      refreshAfterChange();
    } catch (e) {
      setActionError(message(e));
    } finally {
      setBusyId(null);
    }
  };

  // ------------------------------------------------------------- render

  if (loadError) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">{loadError}</Alert>
      </Container>
    );
  }
  if (!catalog || !options || !sourceDef) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const estimate = (n: number) => fmtBytes(n * sourceDef.avgImageBytes);
  const optionKeys: OptionKey[] = [
    "excludeSentToBuyer",
    "excludeSentToAnyBuyer",
    ...sourceDef.options,
    "includeMinors",
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Data Samples
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Build a buyer-ready folder: photos, metadata.json with every label as text, and a README that explains each
          field. Every export is logged per buyer, so monthly deliveries never repeat a photo.
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Section title="1. Buyer">
          {buyersError ? (
            <Alert severity="error">{buyersError}</Alert>
          ) : (
            <BuyerSection
              buyers={buyers}
              selectedId={buyerId}
              onSelect={setBuyerId}
              onCreated={(b) => {
                setBuyers((prev) => [...prev, b].sort((x, y) => x.name.localeCompare(y.name)));
                setBuyerId(b.id);
              }}
              lastExport={lastExport}
              onLoadLast={() => lastExport && applyConfig(lastExport.config)}
            />
          )}
        </Section>

        <Section title="2. Source">
          <SourcePicker sources={catalog.sources} value={source} onChange={setSource} />
        </Section>

        <Section title="3. Filters">
          <Stack spacing={0.5}>
            {optionKeys.map((k) => (
              <Box key={k}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options[k]}
                      onChange={(e) => setOptions({ ...options, [k]: e.target.checked })}
                    />
                  }
                  label={OPTION_TEXT[k].label}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 4, mt: -0.75 }}>
                  {OPTION_TEXT[k].help}
                </Typography>
              </Box>
            ))}
            {options.includeMinors && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                This export can include photos and profile data of people who said they are under 18.
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
              Always applied: photos without an image are skipped, and a photo submitted twice is only offered once.
            </Typography>
          </Stack>
        </Section>

        <Section
          title="4. How many"
          action={
            availability === null && !availabilityError ? <CircularProgress size={18} /> : null
          }
        >
          {availabilityError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {availabilityError}
            </Alert>
          )}
          <QuantitySection
            bristolTypes={catalog.bristolTypes}
            available={available}
            counts={counts}
            total={mode === "custom" ? requested : total}
            mode={mode}
            maxTotal={catalog.maxSamplesPerExport}
            onTotalChange={(n) => {
              setTotal(n);
              if (mode === "custom") setMode("equal");
            }}
            onModeChange={(m) => {
              if (m !== "custom") setTotal(requested || total);
              setMode(m);
            }}
            onCountChange={(i, n) => {
              const next = counts.slice();
              next[i] = n;
              setCounts(next);
              setMode("custom");
            }}
          />
        </Section>

        <Section title={`5. Fields (${selectedFields.length} of ${sourceFields.length}) — the JSON updates as you tick`}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "start",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "minmax(0, 1fr) minmax(0, 1fr)",
                xl: "minmax(0, 3fr) minmax(0, 2fr)",
              },
            }}
          >
            <FieldPicker groups={catalog.groups} fields={sourceFields} selected={selected} onChange={changeFields} />
            {/* Sticks beside the field list while you scroll through the groups. */}
            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: 16 },
                display: "flex",
                flexDirection: "column",
                maxHeight: { xs: 560, md: "calc(100vh - 32px)" },
                minWidth: 0,
              }}
            >
              <JsonPreview
                fields={selectedFields}
                record={previewRecord}
                subtitle={
                  previewRecord
                    ? `A real ${String(
                        (previewRecord["labels"] as Record<string, unknown> | undefined)?.["bristol_type"] ?? "",
                      )} photo from ${sourceDef.title} · ${selectedFields.length} fields`
                    : previewNote
                      ? `${previewNote} — showing example values`
                      : "Example values — loading a real record…"
                }
                loading={previewLoading}
                onShuffle={() => setPreviewNonce((n) => n + 1)}
                firstSampleNumber={buyer?.next_sample_seq ?? 1}
                flash={flash}
              />
            </Box>
          </Box>
        </Section>

        <Section title="6. Prepare & download">
          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "start",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" },
            }}
          >
            <Box>
              <Stack spacing={0.75} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>{requested.toLocaleString()}</strong> photos from <strong>{sourceDef.title}</strong>
                  {buyer ? (
                    <>
                      {" "}
                      for <strong>{buyer.name}</strong>
                    </>
                  ) : null}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFields.length} fields · zip ≈ {estimate(requested)}
                </Typography>
              </Stack>

              {problems.length > 0 && (
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  {problems.map((p) => (
                    <div key={p}>{p}</div>
                  ))}
                </Alert>
              )}
              {actionError && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {actionError}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={preparing ? <CircularProgress size={18} /> : <PrepareIcon />}
                disabled={!canPrepare}
                onClick={() => void prepare()}
              >
                {preparing ? "Picking photos…" : `Prepare ${requested.toLocaleString()} photos`}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                Preparing picks the photos at random and reserves them for this buyer. Nothing is sent anywhere — you
                download the zip and share it yourself.
              </Typography>

              {prepared && (
                <Alert
                  severity={prepared.prepared_count < prepared.requested_count ? "warning" : "success"}
                  sx={{ mt: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={busyId === prepared.id ? <CircularProgress size={14} /> : <DownloadIcon />}
                      disabled={busyId === prepared.id}
                      onClick={() => void download(prepared)}
                    >
                      Download
                    </Button>
                  }
                >
                  Prepared {prepared.prepared_count.toLocaleString()} photos
                  {prepared.prepared_count < prepared.requested_count
                    ? ` (asked for ${prepared.requested_count.toLocaleString()} — the rest were taken meanwhile)`
                    : ""}
                  . Zip ≈ {estimate(prepared.prepared_count)}; it streams straight to your Downloads folder.
                </Alert>
              )}
            </Box>
            <FolderTree
              buyerName={buyer?.name ?? null}
              firstSampleNumber={buyer?.next_sample_seq ?? 1}
              total={requested}
            />
          </Box>
        </Section>
      </Stack>

      {buyer && (
        <Box sx={{ mt: 2 }}>
          <Section
            title={`Deliveries to ${buyer.name}`}
            action={
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => void loadHistory(buyer.id)}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <ExportHistory
              exports={history}
              sources={catalog.sources}
              loading={historyLoading}
              busyId={busyId}
              onDownload={(e) => void download(e)}
              onVoid={(e) => void voidExport(e)}
              onReuse={(e) => applyConfig(e.config)}
            />
          </Section>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Section title="Who has this user's data?">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            For deletion or access requests: lists every buyer that received photos from a person.
          </Typography>
          <PersonLookup />
        </Section>
      </Box>
    </Container>
  );
};

export default DataSamplesView;
