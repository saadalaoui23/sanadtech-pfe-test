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
  
  // 🔧 FIX CRITIQUE : UN SEUL useEffect qui gère TOUT
  useEffect(() => {
    console.log('🎬 Effect principal déclenché:', { letter, searchTerm });
    
    // Reset immédiat et synchrone
    setUsers([]);
    setHasMore(true);
    setTotal(0);
    setPage(1);
    
    // Annuler la requête en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Fonction de fetch locale (pas besoin de useCallback)
    const loadInitialData = async () => {
      console.log('🚀 Démarrage du fetch initial');
      setLoading(true);
      
      try {
        let response;

        if (searchTerm && searchTerm.length >= 2) {
          console.log('📡 Appel searchUsers:', searchTerm);
          response = await searchUsers(searchTerm, pageSize, 1);
        } else {
          console.log('📡 Appel fetchPaginatedUsers:', { letter, page: 1 });
          response = await fetchPaginatedUsers(1, pageSize, letter || undefined);
        }

        // Vérifier que la requête n'a pas été annulée
        if (controller.signal.aborted) {
          console.log('⚠️ Requête annulée');
          return;
        }

        console.log('✅ Réponse reçue:', { 
          usersCount: response.users?.length, 
          total: response.total 
        });

        const newUsers = response.users || [];
        const newTotal = response.total || 0;
        
        // Mise à jour atomique de tous les états
        setUsers(newUsers);
        setTotal(newTotal);
        setPage(1);
        setHasMore(
          typeof response.hasMore === 'boolean' 
            ? response.hasMore 
            : newUsers.length === pageSize
        );
        
        console.log('✅ États mis à jour:', { 
          usersCount: newUsers.length,
          total: newTotal 
        });

      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('❌ Erreur fetch:', err);
          setUsers([]);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Lancer le fetch
    loadInitialData();

    // Cleanup : annuler la requête si le composant démonte ou les deps changent
    return () => {
      console.log('🧹 Cleanup - Annulation de la requête en cours');
      controller.abort();
    };
  }, [letter, searchTerm, pageSize]); // ✅ Dépendances stables

  // 🔧 Fonction loadMore séparée et stable
  const loadMore = useCallback(() => {
    // Empêcher les appels multiples
    if (loading || !hasMore) {
      console.log('⏸️ loadMore ignoré:', { loading, hasMore });
      return;
    }

    console.log('📜 loadMore déclenché - page actuelle:', page);
    
    const nextPage = page + 1;
    setLoading(true);

    const loadMoreData = async () => {
      try {
        let response;

        if (searchTerm && searchTerm.length >= 2) {
          response = await searchUsers(searchTerm, pageSize, nextPage);
        } else {
          response = await fetchPaginatedUsers(nextPage, pageSize, letter || undefined);
        }

        console.log('✅ Page supplémentaire reçue:', response.users?.length);

        const newUsers = response.users || [];
        
        setUsers(prev => [...prev, ...newUsers]);
        setPage(nextPage);
        setHasMore(
          typeof response.hasMore === 'boolean'
            ? response.hasMore
            : newUsers.length === pageSize
        );

      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('❌ Erreur loadMore:', err);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMoreData();
  }, [loading, hasMore, page, letter, searchTerm, pageSize]);

  // 🔧 DEBUG : Log à chaque changement
  useEffect(() => {
    console.log('📊 État FINAL:', { 
      usersCount: users.length, 
      loading, 
      hasMore, 
      total,
      firstUser: users[0]?.name 
    });
  }, [users, loading, hasMore, total]);

  return { 
    users, 
    loading, 
    hasMore, 
    total, 
    loadMore 
  };
};