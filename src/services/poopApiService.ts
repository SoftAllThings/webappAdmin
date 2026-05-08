import {
  CreatePoopRecord,
  UpdatePoopRecord,
  PoopListResponse,
  PoopDetailResponse,
} from "../types/poop";
import { apiClient } from "./api.client";
import { API_BASE_URL, getAuthToken } from "./api.config";

export interface PoopListFilters {
  bristolType?: number;
  color?: number;
  floating?: number;
  consistency?: number;
  health?: number;
  bloodPresent?: boolean;
  mucusPresent?: boolean;
}

class PoopApiService {
  // Get all poop records with pagination
  async getAllPoops(
    page: number = 1,
    limit: number = 10,
    filters: PoopListFilters = {}
  ): Promise<PoopListResponse> {
    console.log("🚀 getAllPoops called with:", { page, limit, filters });

    // Wake up the service first (for Render free tier)
    await apiClient.wakeUpService();
    console.log("🎯 Wake-up complete, making data request");

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters.bristolType !== undefined && filters.bristolType !== null) {
      params.set("bristol_type", filters.bristolType.toString());
    }
    if (filters.color !== undefined && filters.color !== null) {
      params.set("color", filters.color.toString());
    }
    if (filters.floating !== undefined && filters.floating !== null) {
      params.set("floating", filters.floating.toString());
    }
    if (filters.consistency !== undefined && filters.consistency !== null) {
      params.set("consistency", filters.consistency.toString());
    }
    if (filters.health !== undefined && filters.health !== null) {
      params.set("health", filters.health.toString());
    }
    if (filters.bloodPresent) {
      params.set("blood", "present");
    }
    if (filters.mucusPresent) {
      params.set("mucus", "present");
    }

    const url = `/poop?${params.toString()}`;
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

  // Fetch the record's image through the backend proxy and return a blob URL.
  // Blob URLs are same-origin, so canvas reads work without S3 CORS.
  async getImageBlobUrl(id: string): Promise<string> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/poop/${id}/image`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error(`Failed to load image (${response.status})`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  // Replace the record's image with a cropped version (uploads to S3, updates DB)
  async replaceImage(
    id: string,
    imageBase64: string
  ): Promise<PoopDetailResponse> {
    return apiClient.fetch<PoopDetailResponse>(`/poop/${id}/replace-image`, {
      method: "POST",
      body: JSON.stringify({ imageBase64 }),
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
