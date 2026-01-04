import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '../types';
import { fetchPaginatedUsers, searchUsers } from '../services/api';

export const useUserData = (options: { 
  letter: string | null; 
  searchTerm: string; 
  pageSize?: number 
}) => {
  const { letter, searchTerm, pageSize = 50 } = options;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 🟢 EFFECT PRINCIPAL : Gère le reset et le premier chargement
  useEffect(() => {
    // 1. Reset des états
    setUsers([]);
    setHasMore(true);
    setTotal(0);
    setPage(1);
    
    // 2. Annulation de la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const loadInitialData = async () => {
      setLoading(true);
      try {
        let response;

        // ⚡ OPTIMISATION : On déclenche la recherche dès 1 caractère
        // Grâce à l'index GIN du backend, c'est instantané même sur 10M users.
        if (searchTerm && searchTerm.trim().length >= 1) {
          response = await searchUsers(searchTerm, pageSize, 1);
        } else {
          // Sinon mode navigation par lettre ou liste complète
          response = await fetchPaginatedUsers(1, pageSize, letter || undefined);
        }

        if (controller.signal.aborted) return;

        const newUsers = response.users || [];
        
        setUsers(newUsers);
        setTotal(response.total || 0);
        setPage(1);
        setHasMore(response.hasMore); // On fait confiance au booléen du backend

      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('❌ Erreur fetch:', err);
          setUsers([]);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      controller.abort();
    };
  }, [letter, searchTerm, pageSize]);

  // 🟢 LOAD MORE : Gère le scroll infini
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setLoading(true);

    const loadMoreData = async () => {
      try {
        let response;

        // On garde la même logique de seuil (>= 1)
        if (searchTerm && searchTerm.trim().length >= 1) {
          response = await searchUsers(searchTerm, pageSize, nextPage);
        } else {
          response = await fetchPaginatedUsers(nextPage, pageSize, letter || undefined);
        }

        setUsers(prev => [...prev, ...response.users]);
        setPage(nextPage);
        setHasMore(response.hasMore);

      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('❌ Erreur loadMore:', err);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMoreData();
  }, [loading, hasMore, page, letter, searchTerm, pageSize]);

  return { users, loading, hasMore, total, loadMore };
};