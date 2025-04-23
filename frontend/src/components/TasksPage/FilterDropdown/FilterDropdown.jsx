import React, { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

export default function FilterDropdown({ label, options, selectedOptions, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionToggle = (option) => {
    if (selectedOptions.includes(option)) {
      onChange(selectedOptions.filter((o) => o !== option));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="btn btn-sm btn-primary dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
      </button>
      {open && (
        <div className="dropdown-menu show p-2 shadow">
          {options.map((option) => (
            <div key={option} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`${label}-${option}`}
                checked={selectedOptions.includes(option)}
                onChange={() => handleOptionToggle(option)}
              />
              <label
                className="form-check-label"
                htmlFor={`${label}-${option}`}
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
