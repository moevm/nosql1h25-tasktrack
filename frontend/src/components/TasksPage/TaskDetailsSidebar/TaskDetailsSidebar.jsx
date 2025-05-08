import React, { useState, useEffect } from 'react';
import './TaskDetailsSidebar.css';
import { SERVER } from '../../../Constants';

export default function TaskDetailsSidebar({ task, onClose }) {
  const [animationState, setAnimationState] = useState('');
  const [currentTask, setCurrentTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const taskId = task?.taskId;
  const token = localStorage.getItem('token');

  // Загрузка данных задачи
  useEffect(() => {
    if (task) {
      setAnimationState('open');
      fetch(`${SERVER}/api/task/${taskId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCurrentTask(data);
          setStatus(data.status);
          setPriority(data.priority);
          setNotes(data.notes || []);
          setTags(data.tags || []);
        });
    } else {
      setAnimationState('closing');
    }
  }, [task]);

  // Загрузка всех доступных тегов
  useEffect(() => {
    fetch(`${SERVER}/api/tag/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setAllTags(data.tags.map((t) => t.name)));
  }, []);

  const handleAnimationEnd = () => {
    if (animationState === 'closing') {
      setCurrentTask(null);
      onClose();
    }
  };

  const handleClose = () => {
    setAnimationState('closing');
  };

  const handleAddNote = () => {
    if (newNote.trim() !== '') {
      setNotes([...notes, newNote]);
      setNewNote('');
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = [...notes];
    updatedNotes.splice(index, 1);
    setNotes(updatedNotes);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  // Функция для обновления тегов на сервере
  const updateTagsOnServer = async (updatedTags) => {
    try {
      const response = await fetch(`${SERVER}/api/task/${taskId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tag_names: updatedTags,
        }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении тегов');

      // Опционально: можно обновить currentTask после успешного PATCH
      setCurrentTask((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
    } catch (error) {
      console.error('Ошибка обновления тегов:', error);
      alert('Не удалось сохранить изменения в тегах');
    }
  };

  const handleAddTag = (tag) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      updateTagsOnServer(updatedTags);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    updateTagsOnServer(updatedTags);
  };

  const formatDate = (date) => {
    const localDate = new Date(date);
    localDate.setHours(localDate.getHours() + 8); // прибавляем 8 часов

    return localDate.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <div
      className={`task-details-sidebar ${animationState}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="status-priority-container">
        {/* Статус и Приоритет */}
        <div className="status-container">
          <label htmlFor="status" className="dropdown-label">
            Статус
          </label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            className="dropdown"
          >
            <option value="todo">Сделать</option>
            <option value="in_progress">В процессе</option>
            <option value="done">Завершено</option>
          </select>
        </div>

        <div className="priority-container">
          <label htmlFor="priority" className="dropdown-label">
            Приоритет
          </label>
          <select
            id="priority"
            value={priority}
            onChange={handlePriorityChange}
            className="dropdown"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <button onClick={handleClose} className="close-button">
          &times;
        </button>
      </div>

      <div className="task-details">
        <h3>{currentTask?.title}</h3>
        <p>{currentTask?.content || 'Нет описания'}</p>

        {/* Теги */}
        <div className="tags-section">
          <strong>Теги:</strong>
          <div className="tag-list">
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="delete-tag-button"
                  >
                    &times;
                  </button>
                </span>
              ))
            ) : (
              <span className="no-tags">Нет тегов</span>
            )}
          </div>
        </div>

        <div className="additional-info">
          <span>
            Дата изменения:{' '}
            {currentTask?.updated_at && formatDate(currentTask.updated_at)}
          </span>
          <span>
            Дата создания:{' '}
            {currentTask?.created_at && formatDate(currentTask.created_at)}
          </span>
          <span>
            Дата завершения:{' '}
            {currentTask?.deadline && formatDate(currentTask.deadline)}
          </span>
        </div>
      </div>

      {/* Заметки */}
      <h4 className="notes-label">Заметки</h4>
      <div className="notes-section">
        <div className="notes-list">
          {notes.map((note, index) => (
            <div key={index} className="note-card">
              <p>{note}</p>
              <div className="note-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteNote(index)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="add-note-container">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Введите текст"
        />
      </div>

      {/* Кнопки */}
      <div className="footer-buttons">
        <button className="edit-button">Редактировать</button>
        <button className="delete-button">Удалить</button>
        <button className="add-note-button" onClick={handleAddNote}>
          Добавить заметку
        </button>
        <button className="history-button">История изменений</button>
        
        <button className="add-tag-button" onClick={() => setIsModalOpen(true)}>
          Добавить тег
        </button>
      </div>

      {/* Модальное окно выбора тегов */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Выберите тег</h4>
            <ul>
              {allTags.map((tag, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => handleAddTag(tag)}
                      checked={tags.includes(tag)}
                    />
                    {tag}
                  </label>
                </li>
              ))}
            </ul>
            <button onClick={() => setIsModalOpen(false)}>Готово</button>
          </div>
        </div>
      )}
    </div>
  );
}
