import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import { searchUsers } from '../services/api';
import { debounce } from '../utils/helpers';

/**
 * Hook for search functionality with debouncing
 */
export const useSearch = (debounceMs: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchUsers(query, 100);
      setResults(data.users);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      performSearch(query);
    }, debounceMs),
    [performSearch, debounceMs]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    results,
    loading,
    error,
    handleSearchChange,
    clearSearch,
  };
};
