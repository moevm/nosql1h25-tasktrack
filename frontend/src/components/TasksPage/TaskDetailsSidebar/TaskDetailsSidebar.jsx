import React, { useState, useEffect } from 'react';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import './TaskDetailsSidebar.css';
import { SERVER } from '../../../Constants';

export default function TaskDetailsSidebar({ task, onClose, onTaskUpdate }) {
  const [animationState, setAnimationState] = useState('closing');
  const [currentTask, setCurrentTask] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleAddNote = async () => {
    if (newNote.trim() === '') return;

    const noteText = newNote.trim();
    if (noteText.length > 200) {
      alert('Заметка не может превышать 200 символов');
      return;
    }
    setNewNote('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SERVER}/api/task/${currentTask.task_id}/note/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: noteText }),
        },
      );

      if (!response.ok) throw new Error('Ошибка при добавлении заметки');

      const data = await response.json();

      // Добавляем новую заметку в список
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          text: data.text,
          created_at: data.created_at,
          note_id: data.note_id,
        },
      ]);

      // Опционально: можно вызвать onTaskUpdate(), если нужно обновить всю задачу
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить заметку.');
    }
  };

  // Фильтрация тегов по поиску
  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase()),
  );

  const handleDeleteTask = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SERVER}/api/task/${currentTask.task_id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) throw new Error('Ошибка при удалении задачи');

      handleClose();
      onTaskUpdate();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить задачу.');
    }
  };

  const handleDeleteNote = async (index) => {
    const noteToDelete = notes[index];
    if (!window.confirm('Вы уверены, что хотите удалить эту заметку?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${SERVER}/api/task/${currentTask.task_id}/note/${noteToDelete.note_id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) throw new Error('Ошибка при удалении заметки');

      // Удаляем заметку из UI
      const updatedNotes = [...notes];
      updatedNotes.splice(index, 1);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось удалить заметку.');
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);

    // Отправляем PATCH-запрос с новым статусом
    updateTaskOnServer({ status: newStatus });
  };

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    setPriority(newPriority);

    // Отправляем PATCH-запрос с новым приоритетом
    updateTaskOnServer({ priority: newPriority });
  };

  const updateTaskOnServer = async (updatedFields) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SERVER}/api/task/${currentTask.task_id}/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedFields),
        },
      );

      if (!response.ok) throw new Error('Ошибка при обновлении задачи');

      const updatedTask = await response.json();
      setCurrentTask(updatedTask); // Обновляем текущую задачу
      onTaskUpdate(updatedTask); // Передаем обновленную задачу наверх
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      alert('Не удалось сохранить изменения');
    }
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

  const formatDate = (date, template = '') => {
    const localDate = new Date(date);
    if (template !== 'deadline' && template !== 'note') {
      localDate.setHours(localDate.getHours() + 8); // прибавляем 8 часов
    }

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
                    aria-label="Удалить тег"
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
            {currentTask?.deadline &&
              formatDate(currentTask.deadline, 'deadline')}
          </span>
        </div>
      </div>

      {/* Заметки */}
      <h4 className="notes-label">Заметки</h4>
      <div className="notes-section">
        <div className="notes-list">
          {notes.map((note, index) => (
            <div key={note.note_id} className="note-card">
              <p>{note.text}</p>
              <small>{formatDate(note.created_at, 'note')}</small>{' '}
              {/* Опционально */}
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
          maxLength={200}
          placeholder="Введите текст"
        />
      </div>

      {/* Кнопки */}
      <div className="footer-buttons">
        <button
          className="edit-button"
          onClick={() => setIsEditModalOpen(true)}
        >
          Редактировать
        </button>
        <button className="delete-button" onClick={handleDeleteTask}>
          Удалить
        </button>
        <button className="add-note-button" onClick={handleAddNote}>
          Добавить заметку
        </button>
        <button className="history-button">История изменений</button>

        <button className="add-tag-button" onClick={() => setIsModalOpen(true)}>
          Добавить тег
        </button>
      </div>

      {/* Модальное окно редактирования задачи */}
      {isEditModalOpen && currentTask && (
        <EditTaskModal
          task={{
            task_id: currentTask.task_id,
            title: currentTask.title,
            content: currentTask.content,
            deadline: currentTask.deadline,
          }}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedTask) => {
            setCurrentTask(updatedTask);
            onTaskUpdate(); // Вызываем новую пропсу
          }}
        />
      )}

      {/* Модальное окно выбора тегов */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Выберите тег</h4>
              <button
                id="modal-close-btn1"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <input
                type="text"
                placeholder="Поиск по тегам..."
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <div className="modal-tags-container">
                <ul className="modal-tags-list">
                  {filteredTags.length > 0 ? (
                    filteredTags.map((tag, index) => (
                      <div className="item-tag-list">
                        <li key={index}>
                          <label>
                            <input
                              type="checkbox"
                              checked={tags.includes(tag)}
                              onChange={() => handleAddTag(tag)}
                            />
                            <span>{tag}</span>
                          </label>
                        </li>
                      </div>
                    ))
                  ) : (
                    <span>Нет подходящих тегов</span>
                  )}
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
