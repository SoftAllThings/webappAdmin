import { API_BASE_URL, getAuthToken } from "./api.config";

export type UserExportFilters = {
  premium?: boolean;
  createdAtFrom?: string;
  createdAtTo?: string;
};

export type UserExportRequest = {
  useCollectionGroup?: boolean;
  filters?: UserExportFilters;
};

class UserExportApiService {
  async exportUsersCsv(request: UserExportRequest): Promise<Blob> {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/firebase/users/export-csv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let message = `Failed to export users CSV: ${response.status}`;

      try {
        const errorBody = (await response.json()) as {
          error?: { message?: string };
        };
        if (errorBody.error?.message) {
          message = errorBody.error.message;
        }
      } catch {
        // Keep the fallback message if the response body is not JSON.
      }

      throw new Error(message);
    }

    return response.blob();
  }
}

export const userExportApiService = new UserExportApiService();
