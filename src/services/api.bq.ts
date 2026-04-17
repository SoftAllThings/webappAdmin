import { apiClient } from "./api.client";

export type Kpis = {
  dau: number;
  signups: number;
  scansCompleted: number;
  ahaUsers: number;
  purchases: number;
};

export type EventSeriesPoint = {
  date: string;
  count: number;
  uniqueUsers: number;
};

export type FunnelType = "signup" | "scan" | "paywall";

export type FunnelStep = {
  step: string;
  users: number;
  dropOffPct: number;
};

export type ErrorRow = {
  event_name: string;
  count: number;
  uniqueUsers: number;
};

type Envelope<T> = { success: boolean; data: T; error?: { message: string } };

function qs(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export const bqApi = {
  async fetchKpis(from: string, to: string): Promise<Kpis> {
    const res = await apiClient.fetch<Envelope<Kpis>>(`/bq/kpis?${qs({ from, to })}`);
    return res.data;
  },

  async fetchEventList(): Promise<string[]> {
    const res = await apiClient.fetch<Envelope<string[]>>(`/bq/events/list`);
    return res.data;
  },

  async fetchEventTimeseries(
    event: string,
    from: string,
    to: string
  ): Promise<EventSeriesPoint[]> {
    const res = await apiClient.fetch<Envelope<EventSeriesPoint[]>>(
      `/bq/events/timeseries?${qs({ event, from, to })}`
    );
    return res.data;
  },

  async fetchFunnel(
    type: FunnelType,
    from: string,
    to: string
  ): Promise<FunnelStep[]> {
    const res = await apiClient.fetch<Envelope<FunnelStep[]>>(
      `/bq/funnel?${qs({ type, from, to })}`
    );
    return res.data;
  },

  async fetchErrors(from: string, to: string): Promise<ErrorRow[]> {
    const res = await apiClient.fetch<Envelope<ErrorRow[]>>(
      `/bq/errors?${qs({ from, to })}`
    );
    return res.data;
  },
};

export function toYYYYMMDD(isoDate: string): string {
  return isoDate.split("-").join("");
}
