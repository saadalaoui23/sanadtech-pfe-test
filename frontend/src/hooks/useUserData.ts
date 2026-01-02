import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '../types';
import { fetchPaginatedUsers, searchUsers } from '../services/api';

export const useUserData = (options: { letter: string | null; searchTerm: string; pageSize?: number }) => {
  const { letter, searchTerm, pageSize = 50 } = options;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Ref pour annuler les requêtes en cours
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fonction centrale de récupération
  const fetchData = useCallback(async (isLoadMore: boolean) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    
    try {
      const targetPage = isLoadMore ? page + 1 : 1;
      let response;

      // Logique de choix d'API
      if (searchTerm && searchTerm.length >= 2) {
        response = await searchUsers(searchTerm, pageSize, targetPage);
      } else {
        response = await fetchPaginatedUsers(targetPage, pageSize, letter || undefined);
      }

      const newUsers = response.users || [];
      const newTotal = response.total || 0;
      
      if (isLoadMore) {
        setUsers(prev => [...prev, ...newUsers]);
        setPage(prev => prev + 1);
      } else {
        setUsers(newUsers);
        setPage(1);
        setTotal(newTotal);
      }

      // Mise à jour intelligente de hasMore
      // Si le backend renvoie 'hasMore', on l'utilise, sinon on devine
      if (typeof response.hasMore === 'boolean') {
        setHasMore(response.hasMore);
      } else {
        setHasMore(newUsers.length === pageSize);
      }

    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        console.error("Erreur fetch:", err);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [page, letter, searchTerm, pageSize]);

  // 1. DÉCLENCHEUR INITIAL (C'est ce qui manquait pour afficher les users à la sélection)
  useEffect(() => {
    setUsers([]);
    setHasMore(true);
    setTotal(0);
    // On appelle fetchData en mode "reset" (false)
    fetchData(false);
  }, [letter, searchTerm]); // Se déclenche à chaque changement de filtre

  // 2. Fonction pour le scroll infini
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(true);
    }
  }, [loading, hasMore, fetchData]);

  return { users, loading, hasMore, total, loadMore };
};