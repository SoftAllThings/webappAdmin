import { apiClient } from "./api.client";

// ============================================================================
// Types — must match webappAdminBe/src/services/mlRunsService.ts, which in
// turn mirrors the JSON emitted by the AI project:
//   deployment/ml/run_manifest.py  and  benchmark/score.py --publish
// ============================================================================

export interface TrainingRun {
  schema_version: number;
  kind: string;
  run_id: string;
  created_at: string;
  git?: { sha?: string; branch?: string; dirty?: boolean };
  dataset?: {
    csv?: string;
    rows?: number;
    csv_md5?: string;
    n_groups?: number;
    gold_set_excluded?: boolean;
    publishable_benchmark?: boolean;
    bristol_distribution?: Record<string, number>;
    color_distribution?: Record<string, number>;
  };
  split?: {
    strategy?: string;
    splitter?: string;
    seed?: number;
    train_rows?: number;
    val_rows?: number;
  };
  config?: Record<string, string | number | boolean>;
  training?: { best_epoch?: number };
  metrics?: {
    composite?: number;
    bristol_accuracy?: number;
    bristol_pm1_accuracy?: number;
    color_macro_f1_trainable?: number;
    secondary_macro_f1?: Record<string, number>;
    secondary_accuracy?: Record<string, number>;
  };
  artifacts?: { onnx_md5?: string; onnx_bytes?: number };
  notes?: string | null;
}

export interface BenchmarkModelScore {
  composite: number;
  images?: number;
  /** When these predictions were generated — may long predate scored_at. */
  predicted_at?: string;
  refusal_rate?: number;
  fields: Record<
    string,
    {
      accuracy?: number;
      macro_f1?: number;
      pm1_accuracy?: number;
      detection_recall?: number | null;
      false_positive_rate?: number | null;
    }
  >;
}

export interface BenchmarkRun {
  run_id: string;
  scored_at?: string;
  prompt_version?: string;
  gold_set_size?: number;
  /** Training run this leaderboard was produced against, when known. */
  model_run_id?: string | null;
  models: Record<string, BenchmarkModelScore>;
}

interface Envelope<T> {
  success: true;
  data: T;
}

class MlRunsApiService {
  async listRuns(): Promise<TrainingRun[]> {
    const res = await apiClient.fetch<Envelope<TrainingRun[]>>("/ml-runs");
    return res.data;
  }

  async getRun(runId: string): Promise<TrainingRun> {
    const res = await apiClient.fetch<Envelope<TrainingRun>>(
      `/ml-runs/${encodeURIComponent(runId)}`,
    );
    return res.data;
  }

  async listBenchmarks(): Promise<BenchmarkRun[]> {
    const res = await apiClient.fetch<Envelope<BenchmarkRun[]>>(
      "/ml-runs/benchmarks/all",
    );
    return res.data;
  }

  /** Drops the backend's 60s cache — use after publishing a new run. */
  async refresh(): Promise<void> {
    await apiClient.fetch<Envelope<{ refreshed: boolean }>>("/ml-runs/refresh", {
      method: "POST",
    });
  }
}

export const mlRunsApi = new MlRunsApiService();
