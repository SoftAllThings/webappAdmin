import { API_BASE_URL, getAuthToken } from "./api.config";

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      username: string;
      role: string;
    };
  };
  error?: {
    message: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  data?: {
    user: {
      username: string;
      role: string;
    };
    valid: boolean;
  };
}

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      return await response.json();
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: { message: "Login request failed" },
      };
    }
  }

  async verifyToken(): Promise<boolean> {
    const token = getAuthToken();
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.warn("Auth verification check failed:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
