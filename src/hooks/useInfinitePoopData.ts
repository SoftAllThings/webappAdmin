import { useState, useEffect, useCallback, useRef } from "react";
import { PoopRecord } from "../types/poop";
import { poopApiService } from "../services/poopApiService";

interface UseInfinitePoopRecordsReturn {
  records: PoopRecord[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export const useInfinitePoopRecords = (
  limit: number = 10,
  bristolType?: number
): UseInfinitePoopRecordsReturn => {
  const [records, setRecords] = useState<PoopRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Use refs to prevent stale closures and dependency cycles
  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const recordsRef = useRef<PoopRecord[]>([]);
  const totalRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  useEffect(() => {
    currentPageRef.current = page;
  }, [page]);

  useEffect(() => {
    totalRef.current = totalRecords;
  }, [totalRecords]);

  const fetchRecords = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (isLoadingRef.current) {
        console.log("⚠️ Already loading, skipping request");
        return;
      }

      try {
        isLoadingRef.current = true;
        console.log(
          `📡 Fetching page ${pageNum} with limit ${limit} (isLoadMore: ${isLoadMore})`
        );

        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response = await poopApiService.getAllPoops(
          pageNum,
          limit,
          bristolType
        );
        console.log("📦 API Response:", {
          dataLength: response.data?.length,
          metaTotal: response.meta?.total,
          page: pageNum,
        });

        if (response.data && response.data.length > 0) {
          setTotalRecords(response.meta.total);
          totalRef.current = response.meta.total;

          if (isLoadMore) {
            // Append new records
            const currentRecords = recordsRef.current;
            const newRecords = response.data.filter(
              (newRecord) =>
                !currentRecords.some(
                  (existingRecord) => existingRecord.id === newRecord.id
                )
            );

            const updatedRecords = [...currentRecords, ...newRecords];
            setRecords(updatedRecords);
            recordsRef.current = updatedRecords;

            const stillHasMore = updatedRecords.length < response.meta.total;
            setHasMore(stillHasMore);

            console.log(
              `📊 LoadMore: ${updatedRecords.length}/${response.meta.total} loaded. Has more: ${stillHasMore}`
            );
          } else {
            // Initial load
            setRecords(response.data);
            recordsRef.current = response.data;

            const stillHasMore = response.data.length < response.meta.total;
            setHasMore(stillHasMore);

            console.log(
              `📊 Initial: ${response.data.length}/${response.meta.total} loaded. Has more: ${stillHasMore}`
            );
          }
        } else {
          // No data returned
          setHasMore(false);
          console.log("📊 No data returned, setting hasMore to false");
        }
      } catch (err) {
        console.error("❌ Error fetching records:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch records"
        );
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [limit] // Only limit as dependency
  );

  const loadMore = useCallback(() => {
    const currentRecords = recordsRef.current;
    const total = totalRef.current;
    const currentPage = currentPageRef.current;

    console.log("🚀 loadMore called:", {
      recordsCount: currentRecords.length,
      total: total,
      currentPage: currentPage,
      isLoading: isLoadingRef.current,
      hasMore: currentRecords.length < total,
    });

    if (isLoadingRef.current || currentRecords.length >= total) {
      console.log("⚠️ Blocked loadMore - already loading or no more data");
      return;
    }

    const nextPage = currentPage + 1;
    setPage(nextPage);
    currentPageRef.current = nextPage;
    fetchRecords(nextPage, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - using refs to prevent dependency cycles

  const refetch = useCallback(() => {
    console.log("🔄 Refetching data");
    setPage(1);
    currentPageRef.current = 1;
    setRecords([]);
    recordsRef.current = [];
    setHasMore(true);
    setTotalRecords(0);
    totalRef.current = 0;
    fetchRecords(1, false);
  }, [fetchRecords]);

  // Initial load and reload when bristolType changes
  useEffect(() => {
    console.log("🚀 Initial useEffect triggered for bristolType:", bristolType);
    setPage(1);
    currentPageRef.current = 1;
    setRecords([]);
    recordsRef.current = [];
    setHasMore(true);
    setTotalRecords(0);
    totalRef.current = 0;
    fetchRecords(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bristolType]); // Reload when bristolType changes

  return {
    records,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  };
};
