import React from 'react';
import AlphabetMenu from '../Navigation/AlphabetMenu';
import type { AlphabetStats } from '../../types';

interface SidebarProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string | null;
  stats: AlphabetStats | null;
  loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLetterClick, activeLetter, stats, loading }) => {
  return (
    <aside className="lg:w-80 flex-shrink-0">
      <AlphabetMenu
        onLetterClick={onLetterClick}
        activeLetter={activeLetter}
        stats={stats}
        loading={loading}
      />
    </aside>
  );
};

export default Sidebar;
