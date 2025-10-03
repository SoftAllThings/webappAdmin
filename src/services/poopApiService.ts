import {
  CreatePoopRecord,
  UpdatePoopRecord,
  PoopListResponse,
  PoopDetailResponse,
} from "../types/poop";

const API_BASE_URL = "https://webappadminbe.onrender.com/api";

class PoopApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Get all poop records with pagination
  async getAllPoops(
    page: number = 1,
    limit: number = 10
  ): Promise<PoopListResponse> {
    return this.fetchApi<PoopListResponse>(`/poop?page=${page}&limit=${limit}`);
  }

  // Get a single poop record by ID
  async getPoopById(id: string): Promise<PoopDetailResponse> {
    return this.fetchApi<PoopDetailResponse>(`/poop/${id}`);
  }

  // Create a new poop record
  async createPoop(data: CreatePoopRecord): Promise<PoopDetailResponse> {
    return this.fetchApi<PoopDetailResponse>("/poop", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update an existing poop record
  async updatePoop(
    id: string,
    data: Partial<UpdatePoopRecord>
  ): Promise<PoopDetailResponse> {
    return this.fetchApi<PoopDetailResponse>(`/poop/${id}`, {
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

    return this.fetchApi<PoopListResponse>(`/poop/search?${queryParams}`);
  }
}

// Export singleton instance
export const poopApiService = new PoopApiService();
