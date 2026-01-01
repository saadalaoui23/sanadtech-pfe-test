import React from 'react';
import type { User } from '../../types';

interface UserItemProps {
  user: User;
}

/**
 * Individual user item component
 * Optimized for rendering in virtual scroll
 */
const UserItem: React.FC<UserItemProps> = ({ user }) => {
  // Generate gradient color based on first letter
  const getGradientColor = (letter: string) => {
    const colors = [
      'from-indigo-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-blue-500 to-cyan-600',
      'from-green-500 to-emerald-600',
      'from-yellow-500 to-orange-600',
      'from-purple-500 to-indigo-600',
      'from-red-500 to-pink-600',
      'from-teal-500 to-cyan-600',
    ];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const initial = user.name.charAt(0).toUpperCase();
  const gradient = getGradientColor(initial);

  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group">
      {/* Avatar */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow duration-200 flex-shrink-0 mr-4`}>
        <span>{initial}</span>
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors duration-200">
          {user.name}
        </h3>
        <p className="text-sm text-gray-500 truncate mt-0.5 group-hover:text-gray-700 transition-colors duration-200">
          {user.email}
        </p>
      </div>

      {/* Arrow Icon */}
      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(UserItem);
