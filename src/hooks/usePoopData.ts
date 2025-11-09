import { useState, useEffect, useCallback } from "react";
import { PoopRecord, UpdatePoopRecord } from "../types/poop";
import { poopApiService } from "../services/poopApiService";

// Hook for CRUD operations
export const usePoopCrud = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecord = async (
    id: string,
    data: Partial<UpdatePoopRecord>
  ): Promise<PoopRecord | null> => {
    try {
      setLoading(true);
      setError(null);

      // Add current date to first_check_date
      const updatedData = {
        ...data,
        first_check_date: new Date().toISOString().split("T")[0],
      };

      const response = await poopApiService.updatePoop(id, updatedData);
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRecord,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export const useLastVerifiedBristolType = () => {
  const [lastType, setLastType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLastType = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const type = await poopApiService.getLastTypeVerified();
      setLastType(type.data.bristol_type);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch last verified type"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLastType();
  }, [fetchLastType]);

  return {
    lastType,
    loading,
    error,
    refetch: fetchLastType,
  };
};
