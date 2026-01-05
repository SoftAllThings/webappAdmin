import { API_BASE_URL, getAuthToken, removeAuthToken, isProduction } from "./api.config";

class ApiClient {
  private isWakeUpAttempted = false;

  // Wake up the service if it's sleeping (Render free tier)
  async wakeUpService(): Promise<void> {
    if (!isProduction()) {
      console.log("🏠 Local development mode - skipping wake-up");
      return;
    }

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
      console.log("⏰ Waiting 3 seconds for service to start...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

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
          removeAuthToken();
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

  // Fetch without auth - for login/public endpoints
  async fetchPublic<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
