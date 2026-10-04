import React from "react";
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Casino as ShuffleIcon } from "@mui/icons-material";
import { FieldDef } from "../../services/api.dataSamples";

interface Props {
  /** Ticked fields, in catalog order — the order the export writes them. */
  fields: FieldDef[];
  /** A real record with every field of the source, or null to show example values. */
  record: Record<string, unknown> | null;
  subtitle: string;
  loading: boolean;
  onShuffle: () => void;
  firstSampleNumber: number;
  /** Fields just switched on; their lines flash. `key` restarts the animation. */
  flash: { ids: Set<string>; key: number };
}

const C = {
  punct: "#64748b",
  key: "#9BF0FF",
  string: "#c3e88d",
  number: "#f78c6c",
  bool: "#c792ea",
  nil: "#64748b",
};

function Value({ v }: { v: unknown }): React.ReactElement {
  if (v === null || v === undefined) {
    return <span style={{ color: C.nil, fontStyle: "italic" }}>null</span>;
  }
  if (typeof v === "string") return <span style={{ color: C.string }}>{JSON.stringify(v)}</span>;
  if (typeof v === "number") return <span style={{ color: C.number }}>{String(v)}</span>;
  if (typeof v === "boolean") return <span style={{ color: C.bool }}>{String(v)}</span>;
  if (Array.isArray(v)) {
    return (
      <>
        <span style={{ color: C.punct }}>[</span>
        {v.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: C.punct }}>, </span>}
            <Value v={item} />
          </React.Fragment>
        ))}
        <span style={{ color: C.punct }}>]</span>
      </>
    );
  }
  const entries = Object.entries(v as Record<string, unknown>);
  return (
    <>
      <span style={{ color: C.punct }}>{"{ "}</span>
      {entries.map(([k, item], i) => (
        <React.Fragment key={k}>
          {i > 0 && <span style={{ color: C.punct }}>, </span>}
          <span style={{ color: C.key }}>{JSON.stringify(k)}</span>
          <span style={{ color: C.punct }}>: </span>
          <Value v={item} />
        </React.Fragment>
      ))}
      <span style={{ color: C.punct }}>{" }"}</span>
    </>
  );
}

interface Line {
  key: string;
  indent: number;
  flash: boolean;
  content: React.ReactNode;
}

const Key: React.FC<{ k: string }> = ({ k }) => (
  <>
    <span style={{ color: C.key }}>{JSON.stringify(k)}</span>
    <span style={{ color: C.punct }}>: </span>
  </>
);

const comma = (last: boolean) => (last ? null : <span style={{ color: C.punct }}>,</span>);

const JsonPreview: React.FC<Props> = ({
  fields,
  record,
  subtitle,
  loading,
  onShuffle,
  firstSampleNumber,
  flash,
}) => {
  const sampleId = `sample_${String(firstSampleNumber).padStart(6, "0")}`;

  // Group the ticked fields, keeping catalog order.
  const groups: Array<{ name: string; fields: FieldDef[] }> = [];
  fields.forEach((f) => {
    const last = groups[groups.length - 1];
    if (last && last.name === f.group) last.fields.push(f);
    else groups.push({ name: f.group, fields: [f] });
  });

  const valueOf = (f: FieldDef): unknown => {
    const group = record?.[f.group] as Record<string, unknown> | undefined;
    // A real record shows its real value — including null, which is the point.
    return group && Object.prototype.hasOwnProperty.call(group, f.name) ? group[f.name] : f.example;
  };

  const lines: Line[] = [
    { key: "open", indent: 0, flash: false, content: <span style={{ color: C.punct }}>[</span> },
    { key: "obj", indent: 1, flash: false, content: <span style={{ color: C.punct }}>{"{"}</span> },
    {
      key: "sample_id",
      indent: 2,
      flash: false,
      content: (
        <>
          <Key k="sample_id" />
          <Value v={sampleId} />
          <span style={{ color: C.punct }}>,</span>
        </>
      ),
    },
    {
      key: "image",
      indent: 2,
      flash: false,
      content: (
        <>
          <Key k="image" />
          <Value v={`images/${sampleId}.jpg`} />
          {comma(groups.length === 0)}
        </>
      ),
    },
  ];

  groups.forEach((g, gi) => {
    const wholeGroupNew = g.fields.every((f) => flash.ids.has(f.id));
    lines.push({
      key: `${g.name}{`,
      indent: 2,
      flash: wholeGroupNew,
      content: (
        <>
          <Key k={g.name} />
          <span style={{ color: C.punct }}>{"{"}</span>
        </>
      ),
    });
    g.fields.forEach((f, fi) => {
      lines.push({
        key: f.id,
        indent: 3,
        flash: flash.ids.has(f.id),
        content: (
          <>
            <Key k={f.name} />
            <Value v={valueOf(f)} />
            {comma(fi === g.fields.length - 1)}
          </>
        ),
      });
    });
    lines.push({
      key: `${g.name}}`,
      indent: 2,
      flash: wholeGroupNew,
      content: (
        <>
          <span style={{ color: C.punct }}>{"}"}</span>
          {comma(gi === groups.length - 1)}
        </>
      ),
    });
  });

  lines.push(
    { key: "close", indent: 1, flash: false, content: <span style={{ color: C.punct }}>{"},"}</span> },
    { key: "more", indent: 1, flash: false, content: <span style={{ color: C.punct }}>… one record per photo</span> },
    { key: "end", indent: 0, flash: false, content: <span style={{ color: C.punct }}>]</span> },
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: "1 1 auto" }}>
      <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontFamily: "monospace" }}>
            metadata.json · live preview
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {subtitle}
          </Typography>
        </Box>
        {loading && <CircularProgress size={16} sx={{ mt: 0.5 }} />}
        <Tooltip title="Show another real photo's record">
          <span>
            <IconButton size="small" onClick={onShuffle} disabled={loading}>
              <ShuffleIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box
        sx={{
          fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
          fontSize: "0.75rem",
          lineHeight: 1.6,
          p: 1.5,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "auto",
          minHeight: 0,
          flex: 1,
          whiteSpace: "pre",
          opacity: loading ? 0.6 : 1,
          transition: "opacity 0.2s",
          "@keyframes dsFlash": {
            "0%": { backgroundColor: "rgba(252, 255, 89, 0.28)" },
            "100%": { backgroundColor: "rgba(252, 255, 89, 0)" },
          },
          "& .ds-flash": { animation: "dsFlash 1.8s ease-out" },
        }}
      >
        {lines.map((l) => (
          <div key={l.flash ? `${l.key}#${flash.key}` : l.key} className={l.flash ? "ds-flash" : undefined}>
            {"  ".repeat(l.indent)}
            {l.content}
          </div>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
        <span style={{ color: C.nil, fontStyle: "italic" }}>null</span> = not recorded for this photo.
      </Typography>
    </Box>
  );
};

export default JsonPreview;
