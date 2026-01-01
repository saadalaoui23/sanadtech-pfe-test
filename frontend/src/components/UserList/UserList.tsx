import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { User } from '../types';
import UserItem from './UserItem';
import './UserList.css';

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
        <div style={style} className="user-item loading-item">
          <div className="loading-spinner">Loading more users...</div>
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
      <div className="user-list empty">
        <p>No users found</p>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <span>
          Showing {users.length.toLocaleString()}
          {total > 0 && ` of ${total.toLocaleString()}`} users
        </span>
      </div>
      <List
        height={CONTAINER_HEIGHT}
        itemCount={hasMore ? users.length + 1 : users.length}
        itemSize={ITEM_HEIGHT}
        width="100%"
        estimatedItemSize={ITEM_HEIGHT}
        overscanCount={5} // Render 5 extra items outside visible area
      >
        {Row}
      </List>
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default UserList;
