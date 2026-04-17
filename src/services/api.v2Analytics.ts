import { apiClient } from "./api.client";

export interface V2Overview {
  individuals: number;
  stoolLogs: number;
  organizations: number;
  latestStoolLogAt: string | null;
  latestIndividualAt: string | null;
}

export interface IndividualRow {
  id: string;
  organization_id: number;
  external_individual_id: string;
  profile_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StoolLogRow {
  id: string;
  individual_id: string;
  organization_id: number;
  event_id: string | null;
  s3_image_key: string | null;
  bristol_type: string | null;
  bristol_type_confidence: number | null;
  health: string | null;
  color: string | null;
  consistency: string | null;
  shape: string | null;
  quantity: string | null;
  blood: string | null;
  mucus: string | null;
  floating: string | null;
  sleep: string | null;
  stress: string | null;
  diet: string | null;
  caffeine: string | null;
  toilet_time: string | null;
  frequency: string | null;
  last_meal: string | null;
  food_groups: string[] | null;
  smell_level: number | null;
  pain_level: number | null;
  duration_minutes: number | null;
  water_glasses: number | null;
  profile_snapshot: Record<string, unknown> | null;
  created_at: string;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; limit: number; offset: number };
}

export interface AggregateRow {
  bucket: string;
  count: number;
}

export interface AggregateResponse {
  success: boolean;
  data: AggregateRow[];
  meta: { groupBy: string };
}

export interface StoolLogStats {
  total: number;
  avgPain: number | null;
  avgSmell: number | null;
  avgDuration: number | null;
  avgWater: number | null;
  avgBristol: number | null;
  withBloodPct: number | null;
  withMucusPct: number | null;
}

export interface ProfileKeyInfo {
  key: string;
  occurrences: number;
  sampleValues: string[];
}

export type IndividualsFilterParams = {
  page?: number;
  limit?: number;
  organization_id?: number | string;
  sex?: string;
  diet?: string;
  age_min?: number | string;
  age_max?: number | string;
  stress_level?: string;
  physical_activity_level?: string;
  water_intake?: string;
  alcohol_consumption?: string;
  medical_condition?: string;
  created_after?: string;
  created_before?: string;
  sortBy?: "created_at" | "updated_at";
  sortDir?: "asc" | "desc";
  // dynamic: profile_<key>=value
  [key: string]: string | number | undefined;
};

export type StoolLogsFilterParams = {
  page?: number;
  limit?: number;
  organization_id?: number | string;
  individual_id?: string;
  bristol_type?: string;
  health?: string;
  color?: string;
  consistency?: string;
  shape?: string;
  quantity?: string;
  blood?: string;
  mucus?: string;
  floating?: string;
  sleep?: string;
  stress?: string;
  diet?: string;
  caffeine?: string;
  toilet_time?: string;
  frequency?: string;
  food_group?: string;
  pain_min?: number | string;
  pain_max?: number | string;
  smell_min?: number | string;
  smell_max?: number | string;
  duration_min?: number | string;
  duration_max?: number | string;
  water_min?: number | string;
  water_max?: number | string;
  created_after?: string;
  created_before?: string;
  profile_sex?: string;
  profile_diet?: string;
  profile_age_min?: number | string;
  profile_age_max?: number | string;
  group_by?: string;
  sortDir?: "asc" | "desc";
};

function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.append(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

class V2AnalyticsApi {
  async getOverview(): Promise<V2Overview> {
    const res = await apiClient.fetch<{ data: V2Overview }>(
      "/v2-analytics/overview"
    );
    return res.data;
  }

  async listIndividuals(
    params: IndividualsFilterParams = {}
  ): Promise<ListResponse<IndividualRow>> {
    return apiClient.fetch<ListResponse<IndividualRow>>(
      `/v2-analytics/individuals${buildQuery(params)}`
    );
  }

  async individualsAggregate(
    groupBy: string,
    params: IndividualsFilterParams = {}
  ): Promise<AggregateResponse> {
    return apiClient.fetch<AggregateResponse>(
      `/v2-analytics/individuals/aggregates${buildQuery({
        ...params,
        group_by: groupBy,
      })}`
    );
  }

  async listStoolLogs(
    params: StoolLogsFilterParams = {}
  ): Promise<ListResponse<StoolLogRow>> {
    return apiClient.fetch<ListResponse<StoolLogRow>>(
      `/v2-analytics/stool-logs${buildQuery(params)}`
    );
  }

  async stoolLogsAggregate(
    groupBy: string,
    params: StoolLogsFilterParams = {}
  ): Promise<AggregateResponse> {
    return apiClient.fetch<AggregateResponse>(
      `/v2-analytics/stool-logs/aggregates${buildQuery({
        ...params,
        group_by: groupBy,
      })}`
    );
  }

  async stoolLogsStats(
    params: StoolLogsFilterParams = {}
  ): Promise<StoolLogStats> {
    const res = await apiClient.fetch<{ data: StoolLogStats }>(
      `/v2-analytics/stool-logs/stats${buildQuery(params)}`
    );
    return res.data;
  }

  async listProfileKeys(): Promise<ProfileKeyInfo[]> {
    const res = await apiClient.fetch<{ data: ProfileKeyInfo[] }>(
      "/v2-analytics/individuals/profile-keys"
    );
    return res.data;
  }
}

export const v2AnalyticsApi = new V2AnalyticsApi();
