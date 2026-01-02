import React, { useCallback, useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UserList from './components/UserList/UserList';
import UserModal from './components/UserList/UserModal';
import SearchBar from './components/Navigation/SearchBar';
import { useUserData } from './hooks/useUserData';
import { useAlphabetNavigation } from './hooks/useAlphabetNavigation';
import type { User } from './types';
import './index.css';

const App: React.FC = () => {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { stats, loading: statsLoading } = useAlphabetNavigation();

  const { users, loading, hasMore, total, loadMore } = useUserData({
    letter: searchTerm.length > 0 ? null : activeLetter,
    searchTerm: searchTerm,
    pageSize: 50,
  });

  console.log('🎯 App.tsx - État actuel:', { 
    usersCount: users.length, 
    loading, 
    hasMore, 
    total,
    firstUser: users[0]?.name 
  });

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.length > 0) setActiveLetter(null);
  }, []);

  const handleLetterClick = useCallback((letter: string) => {
    setSearchTerm('');
    setActiveLetter(prev => prev === letter ? null : letter);
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setActiveLetter(null);
  }, []);

  const handleUserClick = useCallback((user: User) => {
    console.log('👤 Utilisateur cliqué:', user);
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUser(null), 300); // Attendre la fin de l'animation
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <Header />

      {/* Conteneur principal */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:block w-80 flex-none bg-white border-r border-gray-200 overflow-y-auto">
          <Sidebar
            onLetterClick={handleLetterClick}
            activeLetter={activeLetter}
            stats={stats}
            loading={statsLoading}
          />
        </aside>

        {/* Zone principale */}
        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          {/* Barre de recherche */}
          <div className="flex-none p-4 border-b border-gray-100 bg-white">
            <SearchBar value={searchTerm} onSearch={handleSearch} />
            
            {(searchTerm || activeLetter) && (
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600 bg-indigo-50 p-2 rounded-md border border-indigo-100">
                <span>
                  {activeLetter ? `Filtre: Lettre ${activeLetter}` : `Recherche: "${searchTerm}"`} 
                  {total !== undefined && <span className="ml-2 font-bold">({total} résultats)</span>}
                </span>
                <button onClick={handleClearAll} className="text-indigo-600 hover:underline font-medium">
                  Effacer
                </button>
              </div>
            )}
          </div>

          {/* Zone de liste - Prend tout l'espace restant */}
          <div className="flex-1 min-h-0 bg-gray-50">
            <UserList
              users={users}
              onLoadMore={loadMore}
              hasMore={hasMore}
              loading={loading}
              total={total}
              onUserClick={handleUserClick}
            />
          </div>
        </main>
      </div>

      {/* Modal de détails utilisateur */}
      <UserModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default App;