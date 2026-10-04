import React from "react";
import { Box } from "@mui/material";

interface Props {
  buyerName: string | null;
  firstSampleNumber: number;
  total: number;
}

const sampleId = (n: number) => `sample_${String(n).padStart(6, "0")}`;

// Same rules as the backend's exportFolderName(), so the preview matches the zip.
function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "buyer"
  );
}

/** What the buyer sees after unzipping. */
const FolderTree: React.FC<Props> = ({ buyerName, firstSampleNumber, total }) => {
  const n = Math.max(total, 1);
  const folder = `${slug(buyerName ?? "buyer")}_${new Date().toISOString().slice(0, 10)}_${n}-samples`;
  const tree = [
    `${folder}/`,
    `├── images/`,
    `│   ├── ${sampleId(firstSampleNumber)}.jpg`,
    ...(n > 1 ? [`│   └── … ${sampleId(firstSampleNumber + n - 1)}.jpg  (${n.toLocaleString()} photos)`] : []),
    `├── metadata.json   one record per photo`,
    `└── README.md       field dictionary + where the labels come from`,
  ].join("\n");

  return (
    <Box
      component="pre"
      sx={{
        fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
        fontSize: "0.75rem",
        lineHeight: 1.55,
        m: 0,
        p: 1.5,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        overflowX: "auto",
      }}
    >
      {tree}
    </Box>
  );
};

export default FolderTree;
