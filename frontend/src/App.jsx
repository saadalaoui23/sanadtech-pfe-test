import React from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UserList from './components/UserList/UserList';
import SearchBar from './components/Navigation/SearchBar';
import useUserData from './hooks/useUserData';
import useAlphabetNavigation from './hooks/useAlphabetNavigation';
import './index.css';

function App() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { activeLetter, handleLetterClick } = useAlphabetNavigation();
  const { users, loading, hasMore, loadMore } = useUserData(activeLetter, searchTerm);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar onLetterClick={handleLetterClick} activeLetter={activeLetter} />
        <main className="main-content">
          <SearchBar onSearch={handleSearch} />
          <UserList users={users} onLoadMore={loadMore} hasMore={hasMore} loading={loading} />
        </main>
      </div>
    </div>
  );
}

export default App;
