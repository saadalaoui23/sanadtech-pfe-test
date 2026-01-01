import { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from '../services/api';

const useUserData = (initialLetter = null, searchTerm = '') => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async (reset = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const data = await fetchUsers(currentPage, initialLetter, searchTerm);
      
      if (reset) {
        setUsers(data.users);
        setPage(2);
      } else {
        setUsers((prev) => [...prev, ...data.users]);
        setPage((prev) => prev + 1);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, initialLetter, searchTerm, loading]);

  useEffect(() => {
    loadUsers(true);
  }, [initialLetter, searchTerm]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadUsers(false);
    }
  }, [loading, hasMore, loadUsers]);

  return { users, loading, hasMore, error, loadMore };
};

export default useUserData;
