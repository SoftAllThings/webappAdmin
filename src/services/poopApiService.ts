import {
  CreatePoopRecord,
  UpdatePoopRecord,
  PoopListResponse,
  PoopDetailResponse,
} from "../types/poop";
import { apiClient } from "./api.client";

class PoopApiService {
  // Get all poop records with pagination
  async getAllPoops(
    page: number = 1,
    limit: number = 10,
    bristolType?: number
  ): Promise<PoopListResponse> {
    console.log("🚀 getAllPoops called with:", { page, limit, bristolType });

    // Wake up the service first (for Render free tier)
    await apiClient.wakeUpService();
    console.log("🎯 Wake-up complete, making data request");

    let url = `/poop?page=${page}&limit=${limit}`;
    if (bristolType !== undefined && bristolType !== null) {
      url += `&bristol_type=${bristolType}`;
      console.log("🔍 Adding bristol_type filter:", bristolType);
    }

    console.log("📡 Final URL:", url);
    return apiClient.fetch<PoopListResponse>(url);
  }

  // Get a single poop record by ID
  async getPoopById(id: string): Promise<PoopDetailResponse> {
    return apiClient.fetch<PoopDetailResponse>(`/poop/${id}`);
  }

  async getLastTypeVerified(): Promise<{ data: { bristol_type: number } }> {
    return apiClient.fetch<{ data: { bristol_type: number } }>(
      `/poop/lastTypeVerified`
    );
  }

  // Get Bristol type stats from readyToTrainView with summary statistics
  async getBristolStats(): Promise<{
    data: {
      bristolStats: Array<{ bristol_type: number; num: number }>;
      summary: {
        totalPoops: number;
        handledPoops: number;
        readyForAI: number;
        remainingToHandle: number;
      };
    };
  }> {
    return apiClient.fetch<{
      data: {
        bristolStats: Array<{ bristol_type: number; num: number }>;
        summary: {
          totalPoops: number;
          handledPoops: number;
          readyForAI: number;
          remainingToHandle: number;
        };
      };
    }>(`/poop/bristolStats`);
  }

  // Create a new poop record
  async createPoop(data: CreatePoopRecord): Promise<PoopDetailResponse> {
    return apiClient.fetch<PoopDetailResponse>("/poop", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update an existing poop record
  async updatePoop(
    id: string,
    data: Partial<UpdatePoopRecord>
  ): Promise<PoopDetailResponse> {
    return apiClient.fetch<PoopDetailResponse>(`/poop/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Search poop records with criteria
  async searchPoops(
    criteria: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<PoopListResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...criteria,
    });

    return apiClient.fetch<PoopListResponse>(`/poop/search?${queryParams}`);
  }
}

// Export singleton instance
export const poopApiService = new PoopApiService();
