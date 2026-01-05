import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "../services/api.config";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);

        // Optionally verify in background (don't block on it)
        const isValid = await authService.verifyToken();
        if (!isValid) {
          console.warn(
            "Token verification failed, will retry on next API call"
          );
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const response = await authService.login(username, password);

    if (response.success && response.data?.token) {
      const newToken = response.data.token;
      setToken(newToken);
      setIsAuthenticated(true);
      setAuthToken(newToken);
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
