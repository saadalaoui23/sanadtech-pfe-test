import React from 'react';
import { User } from '../../types';
import './UserItem.css';

interface UserItemProps {
  user: User;
}

/**
 * Individual user item component
 * Optimized for rendering in virtual scroll
 */
const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <div className="user-item">
      <div className="user-avatar">
        <span>{user.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-email">{user.email}</p>
      </div>
    </div>
  );
};

export default React.memo(UserItem);
