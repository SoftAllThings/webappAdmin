import { API_BASE_URL, getAuthToken, removeAuthToken } from "./api.config";

// ============================================================================
// Types — must match webappAdminBe/src/services/dataSamples/catalog.ts and
// src/repositories/dataSamples.repository.ts
// ============================================================================

export type SourceKey = "ready_to_train" | "app_poop" | "stool_logs";

export type OptionKey =
  | "excludeSentToBuyer"
  | "excludeSentToAnyBuyer"
  | "includeRejected"
  | "includeWebDemo"
  | "includeMinors";

export type SampleOptions = Record<OptionKey, boolean>;

export interface SourceDef {
  key: SourceKey;
  title: string;
  table: string;
  tagline: string;
  highlights: string[];
  warnings: string[];
  options: OptionKey[];
  provenance: string;
  avgImageBytes: number;
}

export type GroupKey = "labels" | "confidence" | "model_votes" | "user" | "log" | "conditions" | "meta";

export interface GroupDef {
  key: GroupKey;
  title: string;
  description: string;
  warning?: string;
}

export interface FieldDef {
  id: string;
  group: GroupKey;
  name: string;
  title: string;
  description: string;
  values?: string[];
  sources: SourceKey[];
  defaultOn: boolean;
  example: unknown;
}

export interface Catalog {
  sources: SourceDef[];
  groups: GroupDef[];
  fields: FieldDef[];
  bristolTypes: Array<{ type: number; label: string; description: string }>;
  defaultOptions: SampleOptions;
  maxSamplesPerExport: number;
}

export interface Availability {
  perType: Array<{ type: number; available: number }>;
  total: number;
}

export interface Buyer {
  id: number;
  name: string;
  notes: string | null;
  created_at: string;
  /** First sample number of this buyer's next delivery. */
  next_sample_seq: number;
  export_count: number;
  delivered_samples: number;
  last_export_at: string | null;
}

export type ExportStatus = "prepared" | "delivered" | "voided";

export interface ExportConfig {
  source: SourceKey;
  counts: Record<string, number>;
  fields: string[];
  options: SampleOptions;
}

export interface SampleExport {
  id: string;
  buyer_id: number;
  source: SourceKey;
  config: ExportConfig;
  requested_count: number;
  prepared_count: number;
  delivered_count: number | null;
  status: ExportStatus;
  created_by: string | null;
  created_at: string;
  delivered_at: string | null;
  voided_at: string | null;
  per_type: Record<string, number> | null;
}

export interface PersonDelivery {
  buyer_id: number;
  buyer_name: string;
  export_id: string;
  status: ExportStatus;
  created_at: string;
  samples: number;
}

// ============================================================================

/**
 * Like apiClient.fetch, but keeps the server's error message — "no photos
 * left for this buyer" is actionable, "HTTP error 409" is not.
 */
async function call<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/data-samples${endpoint}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  let body: { success?: boolean; data?: T; error?: { message?: string; hint?: string } } = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON body: fall through to the status message */
  }
  if (res.status === 401 || res.status === 403) {
    removeAuthToken();
    window.location.reload();
    throw new Error("Authentication required");
  }
  if (!res.ok || !body.success) {
    const msg = body.error?.message ?? `Request failed (${res.status})`;
    throw new Error(body.error?.hint ? `${msg} — ${body.error.hint}` : msg);
  }
  return body.data as T;
}

export const dataSamplesApi = {
  catalog: () => call<Catalog>("/catalog"),

  availability(source: SourceKey, buyerId: number | null, options: SampleOptions) {
    const q = new URLSearchParams({ source });
    if (buyerId !== null) q.set("buyerId", String(buyerId));
    (Object.keys(options) as OptionKey[]).forEach((k) => q.set(k, String(options[k])));
    return call<Availability>(`/availability?${q.toString()}`);
  },

  /** One random real record with every field the source offers (for the live preview). */
  preview(source: SourceKey, options: SampleOptions) {
    const q = new URLSearchParams({ source });
    (Object.keys(options) as OptionKey[]).forEach((k) => q.set(k, String(options[k])));
    return call<{ record: Record<string, unknown> }>(`/preview?${q.toString()}`);
  },

  buyers: () => call<Buyer[]>("/buyers"),

  createBuyer: (name: string, notes: string) =>
    call<Buyer>("/buyers", { method: "POST", body: JSON.stringify({ name, notes }) }),

  exports: (buyerId: number) => call<SampleExport[]>(`/buyers/${buyerId}/exports`),

  prepare: (buyerId: number, config: ExportConfig) =>
    call<SampleExport>("/exports", { method: "POST", body: JSON.stringify({ buyerId, ...config }) }),

  voidExport: (exportId: string) =>
    call<SampleExport>(`/exports/${exportId}/void`, { method: "POST" }),

  lookup: (q: string) =>
    call<{ uid: string; deliveries: PersonDelivery[] }>(`/lookup?q=${encodeURIComponent(q)}`),

  /**
   * Starts the zip download as a normal browser navigation, so a multi-GB file
   * streams straight to disk instead of being buffered in the tab's memory.
   * The response is an attachment, so the admin page stays where it is.
   */
  async download(exportId: string): Promise<void> {
    const { path } = await call<{ path: string }>(`/exports/${exportId}/download-token`, {
      method: "POST",
    });
    window.location.assign(`${API_BASE_URL}${path}`);
  },
};
