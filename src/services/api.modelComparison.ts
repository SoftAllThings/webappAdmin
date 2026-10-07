import { apiClient } from "./api.client";

// ============================================================================
// Types — must match webappAdminBe/src/services/modelComparisonFields.ts
// ============================================================================

export type FieldName =
  | "bristolType"
  | "consistency"
  | "shape"
  | "quantity"
  | "color"
  | "health"
  | "blood"
  | "mucus"
  | "floating";

export interface TaskPrediction {
  /** Per-class probabilities. null for GPT/Gemini, which only report their pick's confidence. */
  probs: number[] | null;
  labels: string[];
  argmax: number;
  argmaxLabel: string;
  /** 0..1 */
  confidence: number;
}

/** An LLM's "is this stool?" opinion. Production rejects the photo when false. */
export interface StoolGate {
  isStool: boolean;
  /** 0..1 */
  confidence: number;
}

export interface ModelPrediction {
  /** null when the model omitted the field or answered outside its label space. */
  fields: Record<FieldName, TaskPrediction | null>;
  /** null for ONNX models, which have no gate. */
  gate: StoolGate | null;
}

export type ModelRun =
  | {
      ok: true;
      /** ONNX file path, or the LLM model id. */
      source: string;
      inferenceMs: number;
      prediction: ModelPrediction;
    }
  | { ok: false; source: string; inferenceMs: number; error: string };

export type ComparedModel = "production" | "candidate" | "gpt" | "gemini";

export type ComparisonResult = Record<ComparedModel, ModelRun>;

interface CompareResponse {
  success: true;
  data: ComparisonResult;
}

class ModelComparisonApiService {
  /** Send a base64-encoded image (raw or data: URL) to be scored by all four models. */
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
