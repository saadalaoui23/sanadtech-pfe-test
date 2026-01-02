import React, { useEffect, useRef } from 'react';
import type { User } from '../../types'; 
import UserItem from './UserItem';

interface UserListProps {
  users: User[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  total?: number;
  onUserClick?: (user: User) => void;
}

/**
 * UserList avec scroll natif et IntersectionObserver
 * Plus simple et plus fiable que react-window pour ce cas d'usage
 */
const UserList: React.FC<UserListProps> = ({ users, onLoadMore, hasMore, loading, total, onUserClick }) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  
  console.log('🎨 UserList render:', { 
    usersCount: users.length, 
    hasMore, 
    loading,
    total,
    firstUser: users[0]?.name 
  });

  // 🔧 IntersectionObserver pour détecter le scroll vers le bas
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Si l'élément est visible ET qu'on peut charger plus
        if (entry.isIntersecting && hasMore && !loading && !isLoadingRef.current) {
          console.log('📜 Intersection détectée - Chargement de plus de users');
          isLoadingRef.current = true;
          onLoadMore();
          
          // Reset après 1 seconde pour éviter les doubles appels
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 1000);
        }
      },
      {
        root: null,
        rootMargin: '200px', // Charge 200px avant d'atteindre le bas
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, loading, onLoadMore]);

  // Reset du flag de chargement quand loading change
  useEffect(() => {
    if (!loading) {
      isLoadingRef.current = false;
    }
  }, [loading]);

  if (users.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 italic">
        Aucun utilisateur trouvé
      </div>
    );
  }

  if (users.length === 0 && loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-none px-6 py-3 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Liste des utilisateurs ({users.length}{total ? ` / ${total}` : ''})
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-indigo-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span className="text-xs font-medium">Chargement...</span>
            </div>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs - Scroll natif */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {users.map((user) => (
          <UserItem key={user.id} user={user} onClick={onUserClick} />
        ))}
        
        {/* Élément sentinel pour l'IntersectionObserver */}
        {hasMore && (
          <div 
            ref={observerTarget}
            className="flex justify-center items-center py-8"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {/* Message de fin */}
        {!hasMore && users.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            🎉 Tous les utilisateurs ont été chargés ({users.length})
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;