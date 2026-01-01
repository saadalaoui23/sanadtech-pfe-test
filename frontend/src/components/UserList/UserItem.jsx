import React from 'react';

const UserItem = ({ user }) => {
  return (
    <div className="user-item">
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserItem;
