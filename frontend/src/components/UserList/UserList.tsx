import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { User } from '../types';
import UserItem from './UserItem';

interface UserListProps {
  users: User[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  total?: number;
}

const ITEM_HEIGHT = 60;
const CONTAINER_HEIGHT = 600;

/**
 * Virtual scrolling list component using react-window
 * Only renders visible items to maintain performance with millions of items
 */
const UserList: React.FC<UserListProps> = ({
  users,
  onLoadMore,
  hasMore,
  loading,
  total = 0,
}) => {
  // Calculate estimated total item count for better scrollbar
  const estimatedItemCount = useMemo(() => {
    if (users.length > 0 && hasMore) {
      // Estimate based on current data and total if available
      return total > 0 ? total : users.length * 10;
    }
    return users.length;
  }, [users.length, hasMore, total]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    // Load more when approaching the end
    if (index >= users.length - 5 && hasMore && !loading) {
      onLoadMore();
    }

    if (index >= users.length) {
      return (
        <div style={style} className="flex items-center justify-center p-5 border-b border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Loading more users...</div>
        </div>
      );
    }

    return (
      <div style={style}>
        <UserItem user={users[index]} />
      </div>
    );
  };

  if (users.length === 0 && !loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg font-medium">No users found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            Showing <span className="text-indigo-600">{users.length.toLocaleString()}</span>
            {total > 0 && (
              <>
                {' '}of <span className="text-indigo-600">{total.toLocaleString()}</span>
              </>
            )}{' '}
            users
          </span>
          {hasMore && (
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
              More available
            </span>
          )}
        </div>
      </div>

      {/* Virtual List */}
      <div className="relative">
        <List
          height={CONTAINER_HEIGHT}
          itemCount={hasMore ? users.length + 1 : users.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
          estimatedItemSize={ITEM_HEIGHT}
          overscanCount={5}
        >
          {Row}
        </List>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="w-5 h-5 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-600">Loading more users...</span>
        </div>
      )}
    </div>
  );
};

export default UserList;
