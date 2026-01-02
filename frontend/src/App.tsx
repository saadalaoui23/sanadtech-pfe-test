import React, { useCallback, useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UserList from './components/UserList/UserList';
import SearchBar from './components/Navigation/SearchBar';
import { useUserData } from './hooks/useUserData';
import { useAlphabetNavigation } from './hooks/useAlphabetNavigation';
import { useSearch } from './hooks/useSearch';
import './index.css';

const App: React.FC = () => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { stats, loading: statsLoading } = useAlphabetNavigation();

  // Si on cherche, on ignore la lettre active
  const { users, loading, hasMore, total, loadMore } = useUserData({
    letter: searchTerm.length > 0 ? null : activeLetter,
    searchTerm: searchTerm,
    pageSize: 50,
  });

  // Callbacks de navigation exclusive
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.length > 0) setActiveLetter(null);
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    setSearchTerm('');
    setActiveLetter(letter === activeLetter ? null : letter);
  }, [activeLetter]);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setActiveLetter(null);
  }, []);

  return (
    // CHAINON 1: h-full ici prend 100% du #root défini dans index.css
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      
      <div className="flex-none z-20">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-none bg-white border-r border-gray-200 overflow-y-auto">
          <Sidebar
            onLetterClick={handleLetterClick}
            activeLetter={activeLetter || ''}
            stats={stats}
            loading={statsLoading}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          
          {/* Search Bar (Hauteur fixe) */}
          <div className="flex-none p-4 border-b border-gray-100 z-10 bg-white">
            <SearchBar value={searchTerm} onSearch={handleSearch} />
            
            {(searchTerm || activeLetter) && (
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
                <span>
                  {activeLetter ? `Filtre: Lettre ${activeLetter}` : `Recherche: "${searchTerm}"`} 
                  {total !== undefined && <span className="ml-2 font-bold">({total} résultats)</span>}
                </span>
                <button onClick={handleClearAll} className="text-blue-600 hover:underline cursor-pointer">
                  Tout effacer
                </button>
              </div>
            )}
          </div>

          {/* CHAINON 2: flex-1 permet à ce div de prendre tout le reste de la hauteur
              relative est nécessaire pour que AutoSizer se positionne dedans
          */}
          <div className="flex-1 relative w-full">
            <UserList
              users={users}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loading}
              total={total}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;