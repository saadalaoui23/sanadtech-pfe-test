import { useState, useCallback, useEffect } from 'react';
import { AlphabetStats } from '../types';
import { fetchAlphabetStats } from '../services/api';

/**
 * Hook for managing alphabet navigation
 * Fetches alphabet statistics and handles letter selection
 */
export const useAlphabetNavigation = () => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [stats, setStats] = useState<AlphabetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchAlphabetStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load alphabet statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    setActiveLetter(letter);
    // Scroll to top when letter changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearLetter = useCallback(() => {
    setActiveLetter(null);
  }, []);

  return {
    activeLetter,
    stats,
    loading,
    error,
    handleLetterClick,
    clearLetter,
  };
};
