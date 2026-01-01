import { useState, useEffect, useCallback, useRef } from 'react';
import { User, PaginatedUsersResponse } from '../types';
import { fetchPaginatedUsers } from '../services/api';

interface UseUserDataOptions {
  letter?: string | null;
  searchTerm?: string;
  pageSize?: number;
}

/**
 * Hook for managing user data with infinite scroll
 * Handles pagination, filtering, and loading states
 */
export const useUserData = ({
  letter = null,
  searchTerm = '',
  pageSize = 100,
}: UseUserDataOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadUsers = useCallback(
    async (reset: boolean = false) => {
      if (loading) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const currentPage = reset ? 1 : page;
        const data: PaginatedUsersResponse = await fetchPaginatedUsers(
          currentPage,
          pageSize,
          letter || undefined,
          searchTerm || undefined
        );

        if (reset) {
          setUsers(data.users);
          setPage(2);
        } else {
          setUsers((prev) => [...prev, ...data.users]);
          setPage((prev) => prev + 1);
        }

        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load users');
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    },
    [page, letter, searchTerm, pageSize, loading]
  );

  // Reset and reload when filters change
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    loadUsers(true);
  }, [letter, searchTerm]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadUsers(false);
    }
  }, [loading, hasMore, loadUsers]);

  return {
    users,
    loading,
    hasMore,
    error,
    total,
    loadMore,
    refresh: () => loadUsers(true),
  };
};
