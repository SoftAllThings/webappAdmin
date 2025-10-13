import {
  CreatePoopRecord,
  UpdatePoopRecord,
  PoopListResponse,
  PoopDetailResponse,
} from "../types/poop";

const API_BASE_URL = "https://webappadminbe.onrender.com/api";

class PoopApiService {
  private isWakeUpAttempted = false;

  // Wake up the service if it's sleeping (Render free tier)
  private async wakeUpService(): Promise<void> {
    console.log("🔄 Attempting to wake up service...");

    if (this.isWakeUpAttempted) {
      console.log("⏭️ Wake up already attempted, skipping");
      return;
    }

    try {
      this.isWakeUpAttempted = true;
      console.log("📡 Sending wake-up request to:", `${API_BASE_URL}/health`);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log("📥 Wake-up response status:", response.status);

      if (response.ok) {
        console.log("✅ Service is awake and responding");
      } else {
        console.log(
          "⚠️ Service responded but with error status:",
          response.status
        );
      }
    } catch (error) {
      console.log(
        "❌ Wake up attempt failed, service might be starting...",
        error
      );
      // Wait a bit for the service to start
      console.log("⏰ Waiting 3 seconds for service to start...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Get auth token from localStorage
    const token = localStorage.getItem("authToken");

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Token is invalid, redirect to login
          localStorage.removeItem("authToken");
          window.location.reload();
          throw new Error("Authentication required");
        }
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
    limit: number = 10,
    bristolType?: number
  ): Promise<PoopListResponse> {
    console.log("🚀 getAllPoops called - starting wake-up process");
    // Wake up the service first (for Render free tier)
    await this.wakeUpService();
    console.log("🎯 Wake-up complete, making data request");

    let url = `/poop?page=${page}&limit=${limit}`;
    if (bristolType !== undefined && bristolType !== null) {
      url += `&bristol_type=${bristolType}`;
    }

    return this.fetchApi<PoopListResponse>(url);
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
