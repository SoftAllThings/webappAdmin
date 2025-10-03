import { useState, useEffect, useCallback } from "react";
import { PoopRecord, CreatePoopRecord, UpdatePoopRecord } from "../types/poop";
import { poopApiService } from "../services/poopApiService";

// Hook for fetching all poop records with pagination
export const usePoopRecords = (page: number = 1, limit: number = 10) => {
  const [records, setRecords] = useState<PoopRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await poopApiService.getAllPoops(page, limit);
      setRecords(response.data || []);
      setTotalRecords(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    totalRecords,
    loading,
    error,
    refetch: fetchRecords,
  };
};

// Hook for fetching a single poop record
export const usePoopRecord = (id: string | null) => {
  const [record, setRecord] = useState<PoopRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecord = useCallback(async () => {
    if (!id) {
      setRecord(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await poopApiService.getPoopById(id);
      setRecord(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch record");
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  return {
    record,
    loading,
    error,
    refetch: fetchRecord,
  };
};

// Hook for CRUD operations
export const usePoopCrud = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecord = async (
    data: CreatePoopRecord
  ): Promise<PoopRecord | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await poopApiService.createPoop(data);
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRecord = async (
    id: string,
    data: Partial<UpdatePoopRecord>
  ): Promise<PoopRecord | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await poopApiService.updatePoop(id, data);
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRecord,
    updateRecord,
    loading,
    error,
    clearError: () => setError(null),
  };
};

// Hook for searching poop records
export const usePoopSearch = () => {
  const [records, setRecords] = useState<PoopRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRecords = async (
    criteria: Record<string, any> = {},
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await poopApiService.searchPoops(criteria, page, limit);
      setRecords(response.data || []);
      setTotalRecords(response.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    totalRecords,
    loading,
    error,
    searchRecords,
    clearResults: () => {
      setRecords([]);
      setTotalRecords(0);
      setError(null);
    },
  };
};
