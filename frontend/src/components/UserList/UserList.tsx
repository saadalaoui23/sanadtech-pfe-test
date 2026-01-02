import React, { useMemo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import type { User } from '../../types'; 
import UserItem from './UserItem';

const AutoSizerAny = AutoSizer as any;

interface UserListProps {
  users: User[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  total?: number;
}

const ITEM_HEIGHT = 70;

interface ItemData {
  users: User[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

const Row = React.memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: ItemData }) => {
  const { users, hasMore, loading, onLoadMore } = data;

  // Ligne de chargement (si index dépasse le tableau d'users)
  if (index === users.length) {
    if (hasMore && !loading) {
        // Petit délai pour éviter l'erreur "Cannot update during render"
        setTimeout(() => onLoadMore(), 0);
    }
    return (
      <div style={style} className="flex justify-center items-center p-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const user = users[index];
  if (!user) return null;

  return (
    <div style={style}>
      <UserItem user={user} />
    </div>
  );
}, areEqual);

const UserList: React.FC<UserListProps> = ({ users, onLoadMore, hasMore, loading, total }) => {
  
  const itemData = useMemo(() => ({
    users,
    hasMore,
    loading,
    onLoadMore
  }), [users, hasMore, loading, onLoadMore]);

  const itemCount = hasMore ? users.length + 1 : users.length;

  if (users.length === 0 && !loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 p-10">
        <p className="text-xl">Aucun résultat trouvé</p>
      </div>
    );
  }

  return (
    // CHAINON 3: h-full force ce conteneur à remplir le parent (flex-1 de App.tsx)
    <div className="h-full w-full bg-white flex flex-col">
      
      {/* Header Info */}
      <div className="flex-none px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 flex justify-between items-center">
        <span>
          Showing <span className="text-indigo-600">{users.length.toLocaleString()}</span> users
        </span>
        {loading && <span className="text-xs text-indigo-500 animate-pulse">Synchronisation...</span>}
      </div>

      {/* Zone de Liste */}
      {/* flex-1 ici est CRITIQUE pour que le reste de la hauteur soit alloué à AutoSizer */}
      <div className="flex-1 min-h-0 relative">
        <AutoSizerAny>
          {({ height, width }: { height: number; width: number }) => (
            <List
              height={height}
              width={width}
              itemCount={itemCount}
              itemSize={ITEM_HEIGHT}
              itemData={itemData}
              overscanCount={5}
            >
              {Row}
            </List>
          )}
        </AutoSizerAny>
      </div>
    </div>
  );
};

export default UserList;