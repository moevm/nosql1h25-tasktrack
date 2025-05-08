import React, { useState, useRef, useEffect } from 'react';
import '../FilterDropdown/FilterDropdown.css';

export default function DateFilterDropdown({ label, onChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('between');
  const [dates, setDates] = useState({
    start: '',
    end: '',
    exact: '',
    lastValue: '',
    lastUnit: 'days',
  });

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

  const handleApply = () => {
    const filter = { mode };

    if (mode === 'between') {
      filter.start = dates.start;
      filter.end = dates.end;
    } else if (mode === 'exact') {
      filter.exact = dates.exact;
    } else if (mode === 'last') {
      filter.lastValue = dates.lastValue;
      filter.lastUnit = dates.lastUnit;
    }

    onChange(filter); // передаём объект фильтра наверх
    setOpen(false);
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
        <div
          className="dropdown-menu show p-3 shadow"
          style={{ width: '300px' }}
        >
          <div className="mb-2">
            <select
              className="form-select"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="between">Между датами</option>
              <option value="exact">Точная дата</option>
            </select>
          </div>

          {mode === 'between' && (
            <div>
              <input
                type="date"
                className="form-control mb-2"
                value={dates.start}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, start: e.target.value }))
                }
                placeholder="Дата начала"
              />
              <input
                type="date"
                className="form-control"
                value={dates.end}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, end: e.target.value }))
                }
                placeholder="Дата окончания"
              />
            </div>
          )}

          {mode === 'exact' && (
            <div>
              <input
                type="date"
                className="form-control"
                value={dates.exact}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, exact: e.target.value }))
                }
                placeholder="Точная дата"
              />
            </div>
          )}


          <button className="btn btn-success mt-3 w-100" onClick={handleApply}>
            Применить
          </button>
        </div>
      )}
    </div>
  );
}
