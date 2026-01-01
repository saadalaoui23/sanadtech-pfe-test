import React from 'react';
import { AlphabetStats } from '../../types';
import { formatNumber } from '../../utils/helpers';
import './AlphabetMenu.css';

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
    <div className="alphabet-menu">
      <h3 className="alphabet-menu-title">Navigate by Letter</h3>
      <div className="alphabet-buttons">
        {letters.map((letter) => {
          const count = stats?.[letter]?.count || 0;
          const isActive = activeLetter === letter;

          return (
            <button
              key={letter}
              className={`alphabet-button ${isActive ? 'active' : ''} ${count === 0 ? 'disabled' : ''}`}
              onClick={() => onLetterClick(letter)}
              disabled={count === 0 || loading}
              title={`${letter}: ${formatNumber(count)} users`}
            >
              <span className="letter">{letter}</span>
              {count > 0 && (
                <span className="count">{formatNumber(count)}</span>
              )}
            </button>
          );
        })}
      </div>
      {activeLetter && (
        <button className="clear-filter" onClick={() => onLetterClick('')}>
          Clear Filter
        </button>
      )}
    </div>
  );
};

export default AlphabetMenu;
