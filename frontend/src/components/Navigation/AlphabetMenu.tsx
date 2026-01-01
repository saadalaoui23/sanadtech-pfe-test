import React from 'react';
import type { AlphabetStats } from '../../types';
import { formatNumber } from '../../utils/helpers';

interface AlphabetMenuProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string | null;
  stats: AlphabetStats | null;
  loading?: boolean;
}

/**
 * Alphabet navigation menu component
 * Displays A-Z with user counts for each letter
 */
const AlphabetMenu: React.FC<AlphabetMenuProps> = ({
  onLetterClick,
  activeLetter,
  stats,
  loading = false,
}) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Navigate by Letter</h3>
        <p className="text-sm text-gray-500">Click a letter to filter users</p>
      </div>

      {/* Alphabet Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 mb-6">
        {letters.map((letter) => {
          const count = stats?.[letter]?.count || 0;
          const isActive = activeLetter === letter;
          const isEmpty = count === 0;

          return (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={isEmpty || loading}
              title={`${letter}: ${formatNumber(count)} users`}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg
                font-semibold transition-all duration-200 transform
                ${isEmpty
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                  : isActive
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300'
                  : 'bg-gray-50 text-gray-700 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 hover:scale-105 hover:shadow-md border border-transparent'
                }
                ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <span className={`text-lg ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {letter}
              </span>
              {count > 0 && (
                <span className={`text-xs mt-1 ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                  {count > 999 ? `${(count / 1000).toFixed(1)}k` : formatNumber(count)}
                </span>
              )}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Clear Filter Button */}
      {activeLetter && (
        <button
          onClick={() => onLetterClick('')}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
        >
          Clear Filter
        </button>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-semibold text-gray-700">
                {Object.values(stats).reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphabetMenu;
