import { API_BASE_URL, getAuthToken } from "./api.config";

export interface ExportDataset {
  key: string;
  label: string;
  file: string;
  source: "firestore" | "postgres";
  description: string;
}

export interface ExportRequest {
  from: string;
  to: string;
  datasets: string[];
  includeEmails: boolean;
  includeRawPayloads: boolean;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export async function fetchExportDatasets(): Promise<ExportDataset[]> {
  const res = await fetch(`${API_BASE_URL}/export/datasets`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load datasets (${res.status})`);
  const body = (await res.json()) as { data: ExportDataset[] };
  return body.data;
}

/**
 * Downloads the zip. The endpoint is a POST behind a bearer token, so this
 * cannot be a plain <a href> — the response is buffered to a blob and handed
 * to a synthetic anchor.
 */
export async function downloadExport(req: ExportRequest): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/export`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let message = `Export failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) message = body.error.message;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const filename = `poopcheck-export-${req.from}_${req.to}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}
