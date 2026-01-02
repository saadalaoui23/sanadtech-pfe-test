import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '../types';
import { fetchPaginatedUsers, searchUsers } from '../services/api'; // Assurez-vous d'importer searchUsers

interface UseUserDataOptions {
  letter?: string | null;
  searchTerm?: string;
  pageSize?: number;
}

export const useUserData = ({
  letter = null,
  searchTerm = '',
  pageSize = 50, // Recommandé 50 pour performance
}: UseUserDataOptions = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset quand les filtres changent
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    // On laisse loadMore déclencher le premier chargement ou on l'appelle ici
    // loadMore() ne marchera pas bien ici car c'est une closure.
    // L'idéal est d'avoir une fonction fetch dédiée ou d'utiliser un flag.
    // Pour simplifier, on reset juste les états, et le scroll/mount fera le reste.
  }, [letter, searchTerm]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    // Cancel request previous
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      let response;
      
      // LOGIQUE CORRECTE : CHOIX DE L'API SELON LE MODE
      if (searchTerm && searchTerm.length >= 2) {
        // Mode Recherche : On passe la page !
        response = await searchUsers(searchTerm, pageSize, page);
      } else {
        // Mode Navigation standard
        response = await fetchPaginatedUsers(page, pageSize, letter || undefined);
      }

      const newUsers = response.users;

      setUsers((prev) => {
        // Petit hack pour éviter les doublons si React StrictMode double l'appel
        // En prod ce n'est pas nécessaire mais ça sécurise
        const existingIds = new Set(prev.map(u => u.id));
        const uniqueNewUsers = newUsers.filter(u => !existingIds.has(u.id));
        return [...prev, ...uniqueNewUsers];
      });
      
      // Mise à jour de hasMore basée sur la réponse du backend ou la taille de la liste
      if (response.hasMore !== undefined) {
        setHasMore(response.hasMore);
      } else {
        // Fallback si le backend ne renvoie pas hasMore
        setHasMore(newUsers.length === pageSize);
      }
      
      if (newUsers.length > 0) {
          setPage((prev) => prev + 1);
      } else {
          setHasMore(false);
      }

      if (response.total) setTotal(response.total);

    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error("Error loading users:", err);
        setError(err.message || 'Failed to load users');
        setHasMore(false); // Arrêt en cas d'erreur pour éviter boucle
      }
    } finally {
      setLoading(false);
    }
  }, [page, letter, searchTerm, pageSize, loading, hasMore]);

  return {
    users,
    loading,
    hasMore,
    error,
    total,
    loadMore,
    refresh: () => {
        setPage(1);
        setUsers([]);
        setHasMore(true);
        loadMore();
    },
  };
};