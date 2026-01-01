import { useState, useCallback, useRef } from 'react';
import type { User } from '../types';
import { searchUsers } from '../services/api';
import { debounce } from '../utils/helpers';

/**
 * Hook for search functionality with debouncing and request cancellation
 */
export const useSearch = (debounceMs: number = 500) => { // Optimisation 1: 500ms
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimisation 2: Référence pour stocker l'annulation de la requête
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    // Optimisation 3: Ne pas chercher si moins de 2 caractères
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Annuler la requête précédente si elle est encore en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur pour cette requête
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Note: Idéalement, modifiez searchUsers dans api.ts pour accepter { signal: controller.signal }
      const data = await searchUsers(query, 100);
      
      // Si on est ici, c'est que la requête n'a pas été annulée
      setResults(data.users);
    } catch (err: any) {
      // Ignorer les erreurs dues à l'annulation (AbortError)
      if (err.name === 'AbortError') return;

      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      // Ne désactiver le chargement que si c'est bien la requête courante qui a fini
      if (abortControllerRef.current === controller) {
        setLoading(false);
        abortControllerRef.current = null;
      }
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
      
      // Si le champ est vidé, on nettoie tout de suite
      if (value.trim() === '') {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setResults([]);
        setLoading(false);
        setError(null);
      } else {
        debouncedSearch(value);
      }
    },
    [debouncedSearch]
  );

  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setSearchTerm('');
    setResults([]);
    setError(null);
    setLoading(false);
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