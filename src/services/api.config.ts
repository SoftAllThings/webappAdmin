// Centralized API configuration

export const API_BASE_URL =
  process.env["NODE_ENV"] === "production"
    ? "https://webappadminbe.onrender.com/api"
    : "http://localhost:3001/api";

console.log("🔗 API Base URL:", API_BASE_URL);

// Token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

export const isProduction = (): boolean => {
  return process.env["NODE_ENV"] === "production";
};
