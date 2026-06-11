import { API_BASE_URL, getAuthToken, removeAuthToken, isProduction } from "./api.config";

class ApiClient {
  private wakeUpPromise: Promise<void> | null = null;

  // Wake up the service if it's sleeping (Render free tier). Parallel callers
  // share the same in-flight poll; a successful wake is cached for the session.
  wakeUpService(): Promise<void> {
    if (!isProduction()) {
      console.log("🏠 Local development mode - skipping wake-up");
      return Promise.resolve();
    }
    if (!this.wakeUpPromise) {
      this.wakeUpPromise = this.pollHealthUntilReady();
    }
    return this.wakeUpPromise;
  }

  // Poll /health until the backend reports 200 (server up AND database
  // connected — each poll also warms a DB connection server-side).
  // Budget ~54s worst case: a cold Render dyno alone can take 30-60s to boot.
  private async pollHealthUntilReady(): Promise<void> {
    const maxAttempts = 8;
    const attemptTimeoutMs = 5000;
    const delayMs = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `📡 Wake-up attempt ${attempt}/${maxAttempts}:`,
          `${API_BASE_URL}/health`
        );
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(attemptTimeoutMs),
        });
        if (response.ok) {
          console.log("✅ Service is awake and database is connected");
          return;
        }
        // 503 = server up but DB still warming → keep polling
        console.log("⚠️ Service responded with status:", response.status);
      } catch (error) {
        // Abort or network error: dyno may still be booting → keep polling
        console.log("⏳ Wake-up attempt failed, service might be starting...");
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    // Give up but resolve anyway — backend per-request retries are the next
    // safety net. Reset so a later user action can re-attempt the wake.
    console.log("❌ Wake-up budget exhausted, proceeding with requests");
    this.wakeUpPromise = null;
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
