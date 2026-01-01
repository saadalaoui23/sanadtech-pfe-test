import React from 'react';
import AlphabetMenu from '../Navigation/AlphabetMenu';
import { AlphabetStats } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  onLetterClick: (letter: string) => void;
  activeLetter: string | null;
  stats: AlphabetStats | null;
  loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLetterClick, activeLetter, stats, loading }) => {
  return (
    <aside className="sidebar">
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
