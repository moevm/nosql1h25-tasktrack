// SearchBar.jsx
import React from 'react';
import './SearchBar.css'; // Стили для поискового поля

export default function SearchBar({
  searchQuery,
  handleSearchChange,
  TitleFind,
  handleSearchSubmit,
}) {
  return (
    <div className="search-container">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
        placeholder={TitleFind}
      />
      <button onClick={handleSearchSubmit} className="search-button">
        <i className="fas fa-search"></i>
      </button>
    </div>
  );
}
