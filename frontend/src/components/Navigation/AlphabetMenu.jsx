import React from 'react';

const AlphabetMenu = ({ onLetterClick, activeLetter }) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="alphabet-menu">
      {letters.map((letter) => (
        <button
          key={letter}
          className={`alphabet-button ${activeLetter === letter ? 'active' : ''}`}
          onClick={() => onLetterClick(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default AlphabetMenu;
