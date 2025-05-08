import React from 'react';
import './SearchBar.css';

export default function SearchBar({
  searchQuery,
  handleSearchChange,
  TitleFind,
  handleSearchSubmit,
}) {
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSearchSubmit();
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="search-input"
        placeholder={TitleFind}
      />
      <button onClick={handleSearchSubmit} className="search-button">
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
}
