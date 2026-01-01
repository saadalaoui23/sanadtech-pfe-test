import React from 'react';
import UserItem from './UserItem';
import VirtualScroller from './VirtualScroller';

const UserList = ({ users, onLoadMore, hasMore, loading }) => {
  return (
    <div className="user-list">
      <VirtualScroller
        items={users}
        renderItem={(user) => <UserItem key={user.id} user={user} />}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        loading={loading}
      />
    </div>
  );
};

export default UserList;
