import { useState, useEffect, useCallback } from 'react';

/**
 * Custom fetch hook for centralized state management + Refetch capability.
 * @param {Function} apiFn - The service function (e.g., getPlatformStats).
 * @returns {object} - { data, loading, err, refetch }.
 */
export const useFetch = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const res = await apiFn();
      setData(res?.data !== undefined ? res.data : res);
    } catch (error) {
      setErr(error?.message || 'Synchronization error. Verify backend status.');
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, err, refetch: loadData };
};
