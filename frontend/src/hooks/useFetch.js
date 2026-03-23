import { useState, useEffect, useCallback } from "react";

/**
 * Custom fetch hook for centralized state management + Refetch capability.
 * @param {Function} apiFn - The service function (e.g., getProfile).
 * @returns {object} - { data, loading, err, refetch }.
 */
export const useFetch = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // useCallback to ensure the function reference stays stable
  const loadData = useCallback(async (isRefetch = false) => {
    // Only set loading if it's the initial call or user triggered refetch
    setLoading(true);
    setErr(null); // Reset error state on new attempts
    
    try {
      const res = await apiFn();
      // Assuming backend structure: { success, data, message }
      setData(res.data);
    } catch (e) {
      setErr("Synchronization error. Verify backend status.");
    } finally {
      // Simulate slight network delay for visual feedback on sync
      setTimeout(() => setLoading(false), 800);
    }
  }, [apiFn]);

  // Initial load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Returning the loadData as 'refetch' for manual triggering
  return { data, loading, err, refetch: () => loadData(true) };
};
