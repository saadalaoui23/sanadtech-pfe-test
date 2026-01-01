import React, { useState, useCallback } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import UserList from './components/UserList/UserList';
import SearchBar from './components/Navigation/SearchBar';
import { useUserData } from './hooks/useUserData';
import { useAlphabetNavigation } from './hooks/useAlphabetNavigation';
import { useSearch } from './hooks/useSearch';
import './index.css';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <Sidebar
              onLetterClick={handleLetterClickWithClear}
              activeLetter={activeLetter}
              stats={stats}
              loading={statsLoading}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <SearchBar onSearch={handleSearchChange} value={searchTerm} />

            {/* Search Results Info */}
            {isSearching && (
              <div className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Found {searchResults.length.toLocaleString()} result
                      {searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-600">
                      for &quot;<span className="font-medium text-indigo-600">{searchTerm}</span>&quot;
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            {/* User List */}
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
    </div>
  );
};

export default App;
