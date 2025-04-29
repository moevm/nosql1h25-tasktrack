import React, { useState } from 'react';

export default function SortModal({ fields, onApply, onClose }) {
  const [selectedField, setSelectedField] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'asc', 'desc', 'none'

  const handleApply = () => {
    onApply(selectedField, sortOrder);
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5 className="modal-title mb-3">Сортировка</h5>

          <div className="form-group mb-3">
            <label>Поле для сортировки:</label>
            <select
              className="form-control"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
            >
              <option value="">Выберите поле</option>
              {fields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-3">
            <label>Порядок сортировки:</label>
            <select
              className="form-control"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="none">Нет сортировки</option>
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button className="btn btn-primary" onClick={handleApply}>
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
