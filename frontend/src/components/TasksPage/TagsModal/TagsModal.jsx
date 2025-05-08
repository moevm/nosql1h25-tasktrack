import React, { useEffect, useState } from 'react';
import SearchBar from '../../SearchBar/SearchBar'; // Импорт готового SearchBar
import './TagsModal.css';

import { SERVER } from '../../../Constants'; // Используем константу SERVER

export default function TagsModal({ isOpen, onClose, setSelectedTask }) {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Для фильтрации тегов
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setSelectedTask(null); // Сбрасываем выбранную задачу при открытии модального окна
      fetchTags();
    }
  }, [isOpen]);

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/tag/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Ошибка загрузки тегов');
      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить теги.');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    if (newTagName.length > 50) {
      setError('Название тега не должно превышать 50 символов.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/tag/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTagName }),
      });
      if (!response.ok) throw new Error('Ошибка при создании тега');
      setNewTagName('');
      fetchTags();
    } catch (err) {
      setError('Не удалось создать тег.');
    }
  };

  const handleDeleteTag = async (tagName) => {
    if (!window.confirm(`Удалить тег "${tagName}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SERVER}/api/tag/${encodeURIComponent(tagName)}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) throw new Error('Ошибка при удалении тега');
      fetchTags();
    } catch (err) {
      setError('Не удалось удалить тег.');
      console.error(err);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editingTag.newName.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SERVER}/api/tag/${encodeURIComponent(editingTag.oldName)}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editingTag.newName }),
        },
      );
      if (!response.ok) throw new Error('Ошибка при обновлении тега');
      setEditingTag(null);
      fetchTags();
    } catch (err) {
      setError('Не удалось обновить тег.');
      console.error(err);
    }
  };

  // Фильтрация тегов по searchQuery
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="tags-modal-overlay">
      <div className="tags-modal-content">
        <h5>Управление тегами</h5>
        {error && <div className="tags-modal-alert">{error}</div>}

        {/* Поиск по тегам */}
        <SearchBar
          TitleFind="Поиск по тегам"
          searchQuery={searchQuery}
          handleSearchChange={(e) => setSearchQuery(e.target.value)}
          handleSearchSubmit={() => {}} // можно оставить пустым, если поиск мгновенный
        />

        {/* Добавление нового тега */}
        <div className="tags-modal-input-group">
          <input
            type="text"
            className="add-tag-input"
            placeholder="Новый тег..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            maxLength={50}
          />
          <button
            className="add-tag-button"
            onClick={handleCreateTag}
            disabled={!newTagName.trim()}
            title="Добавить тег"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        {/* Список тегов */}
        {/* Контейнер со скроллом только для тегов */}
        <div className="tags-modal-list-container">
          <ul className="tags-modal-list-group">
            {filteredTags.map((tag, index) => (
              <li key={index} className="tags-modal-list-group-item">
                {editingTag?.oldName === tag.name ? (
                  <>
                    <input
                      type="text"
                      className="form-control form-control-sm me-2"
                      value={editingTag.newName}
                      onChange={(e) =>
                        setEditingTag({
                          ...editingTag,
                          newName: e.target.value,
                        })
                      }
                    />
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={handleEditTag}
                    >
                      Сохранить
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingTag(null)}
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <>
                    <span>{tag.name}</span>
                    <div>
                      <button
                        className="btn btn-sm btn-warning me-1"
                        onClick={() =>
                          setEditingTag({
                            oldName: tag.name,
                            newName: tag.name,
                          })
                        }
                      >
                        Редактировать
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteTag(tag.name)}
                      >
                        Удалить
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Кнопка закрытия */}
        <button className="tags-modal-btn-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
