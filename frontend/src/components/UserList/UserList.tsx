import React, { useMemo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import {AutoSizer} from 'react-virtualized-auto-sizer';
import type { User } from '../../types'; 
import UserItem from './UserItem';

// Sécurité pour l'import AutoSizer selon les versions
const AutoSizerAny = (AutoSizer as any).default || AutoSizer;

interface UserListProps {
  users: User[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  total?: number;
}

const ITEM_HEIGHT = 80;

interface ItemData {
  users: User[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

const Row = React.memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: ItemData }) => {
  const { users, hasMore, loading, onLoadMore } = data;

  // Ligne du loader
  if (index === users.length) {
    if (hasMore && !loading) {
        setTimeout(() => onLoadMore(), 0);
    }
    return (
      <div style={style} className="flex justify-center items-center py-4">
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
      <div className="h-full w-full flex items-center justify-center text-gray-500 italic">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="flex-none px-6 py-2 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
        <span>Liste des utilisateurs</span>
        {loading && <span className="text-indigo-600 animate-pulse">Chargement...</span>}
      </div>

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