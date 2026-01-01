import React, { useState, useCallback } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UserList from './components/UserList/UserList';
import SearchBar from './components/Navigation/SearchBar';
import { useUserData } from './hooks/useUserData';
import { useAlphabetNavigation } from './hooks/useAlphabetNavigation';
import { useSearch } from './hooks/useSearch';
import './App.css';

const App: React.FC = () => {
  const { activeLetter, stats, loading: statsLoading, handleLetterClick, clearLetter } =
    useAlphabetNavigation();
  const { searchTerm, results: searchResults, loading: searchLoading, handleSearchChange, clearSearch } =
    useSearch();

  // Use search results if searching, otherwise use regular user data
  const isSearching = searchTerm.length > 0;
  const { users, loading, hasMore, total, loadMore } = useUserData({
    letter: activeLetter,
    searchTerm: isSearching ? searchTerm : '',
    pageSize: 100,
  });

  // Determine which users to display
  const displayUsers = isSearching ? searchResults : users;
  const displayLoading = isSearching ? searchLoading : loading;
  const displayHasMore = isSearching ? false : hasMore;

  const handleLetterClickWithClear = useCallback(
    (letter: string) => {
      if (letter === '') {
        clearLetter();
      } else {
        clearSearch();
        handleLetterClick(letter);
      }
    },
    [clearLetter, clearSearch, handleLetterClick]
  );

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar
          onLetterClick={handleLetterClickWithClear}
          activeLetter={activeLetter}
          stats={stats}
          loading={statsLoading}
        />
        <main className="main-content">
          <SearchBar onSearch={handleSearchChange} value={searchTerm} />
          {isSearching && (
            <div className="search-info">
              <span>
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
              </span>
              <button className="clear-search-button" onClick={clearSearch}>
                Clear search
              </button>
            </div>
          )}
          <UserList
            users={displayUsers}
            onLoadMore={loadMore}
            hasMore={displayHasMore}
            loading={displayLoading}
            total={total}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
