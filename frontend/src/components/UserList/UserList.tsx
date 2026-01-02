import React, { useMemo } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import {AutoSizer} from 'react-virtualized-auto-sizer';
import type { User } from '../../types'; 
import UserItem from './UserItem';

// --- HACK TYPESCRIPT POUR AUTOSIZER ---
// On force le type pour éviter l'erreur "no default export" et "IntrinsicAttributes"
const AutoSizerAny = AutoSizer as any;
// --------------------------------------

interface UserListProps {
  users: User[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  total?: number;
}

const ITEM_HEIGHT = 70;

// Interface pour les données passées à la ligne
interface ItemData {
  users: User[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

// 1. Composant Row sorti pour la performance (évite le re-render infini)
const Row = React.memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: ItemData }) => {
  const { users, hasMore, loading, onLoadMore } = data;

  // Détection de la fin de liste pour le chargement infini
  if (hasMore && !loading && index === users.length - 1) {
    // Le setTimeout est CRITIQUE pour éviter l'erreur "Cannot update component while rendering"
    setTimeout(() => onLoadMore(), 0);
  }

  // Loader en bas de liste
  if (index >= users.length) {
    return (
      <div style={style} className="flex items-center justify-center p-4 border-b border-gray-100">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div style={style}>
      <UserItem user={users[index]} />
    </div>
  );
}, areEqual);

const UserList: React.FC<UserListProps> = ({
  users,
  onLoadMore,
  hasMore,
  loading,
  total = 0,
}) => {
  
  // Mémorisation des données pour react-window
  const itemData = useMemo(() => ({
    users,
    hasMore,
    loading,
    onLoadMore
  }), [users, hasMore, loading, onLoadMore]);

  const itemCount = hasMore ? users.length + 1 : users.length;

  if (users.length === 0 && !loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white p-12 text-center text-gray-500">
        <p className="text-lg font-medium">No users found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-none">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Showing <span className="text-indigo-600">{users.length.toLocaleString()}</span>
            {total > 0 && <> of <span className="text-indigo-600">{total.toLocaleString()}</span></>} users
          </span>
          {hasMore && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
              Loading...
            </span>
          )}
        </div>
      </div>

      {/* Liste Virtuelle */}
      <div className="flex-1 min-h-0">
        <AutoSizerAny>
          {({ height, width }: any) => (
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