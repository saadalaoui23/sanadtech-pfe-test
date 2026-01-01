import React from 'react';
import AlphabetMenu from '../Navigation/AlphabetMenu';

const Sidebar = ({ onLetterClick, activeLetter }) => {
  return (
    <aside className="sidebar">
      <AlphabetMenu onLetterClick={onLetterClick} activeLetter={activeLetter} />
    </aside>
  );
};

export default Sidebar;
