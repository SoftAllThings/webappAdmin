import { apiClient } from "./api.client";

// ============================================================================
// Types — must match webappAdminBe/src/services/modelComparisonService.ts
// ============================================================================

export interface TaskPrediction {
  probs: number[];
  labels: string[];
  argmax: number;
  argmaxLabel: string;
  /** 0..1 */
  confidence: number;
}

export type SecondaryTaskName =
  | "consistency"
  | "shape"
  | "quantity"
  | "color"
  | "health"
  | "blood"
  | "mucus"
  | "floating";

export interface ModelPrediction {
  bristolType: TaskPrediction;
  secondary: Record<SecondaryTaskName, TaskPrediction>;
  inferenceMs: number;
}

export interface ComparisonResult {
  production: ModelPrediction;
  candidate: ModelPrediction;
  productionModelPath: string;
  candidateModelPath: string;
}

interface CompareResponse {
  success: true;
  data: ComparisonResult;
}

class ModelComparisonApiService {
  /** Send a base64-encoded image (raw or data: URL) to be scored by both models. */
  async compare(imageBase64: string): Promise<ComparisonResult> {
    const response = await apiClient.fetch<CompareResponse>(
      "/model-comparison/compare",
      {
        method: "POST",
        body: JSON.stringify({ imageBase64 }),
      },
    );
    return response.data;
  }
}

export const modelComparisonApi = new ModelComparisonApiService();
