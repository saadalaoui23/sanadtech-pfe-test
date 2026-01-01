import React from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onSearch: (value: string) => void;
  value?: string;
  placeholder?: string;
}

/**
 * Search bar component with debouncing handled by parent
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  value = '',
  placeholder = 'Search users by name or email...',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleClear = () => {
    onSearch('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        {value && (
          <button className="clear-button" onClick={handleClear} aria-label="Clear search">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
