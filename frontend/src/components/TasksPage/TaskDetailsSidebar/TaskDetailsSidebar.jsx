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
  const [history, setHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const taskId = task?.taskId;
  const token = localStorage.getItem('token');

  const fetchHistory = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${SERVER}/api/task/${currentTask.task_id}/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Ошибка при загрузке истории');

    const data = await response.json();
    setHistory(data.results || []);
    setIsHistoryModalOpen(true); // Открыть модальное окно
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось загрузить историю изменений.');
  }
};

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
          const adjustedNotes = (data.notes || []).map((note) => {
            const date = new Date(note.created_at);
            date.setHours(date.getHours() - 3);
            return {
              ...note,
              created_at: date.toISOString(),
            };
          });

          setCurrentTask(data);
          setStatus(data.status);
          setPriority(data.priority);
          setNotes(adjustedNotes);
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
      .then((data) => setAllTags(data.tags?.map((t) => t.name) || []));
  }, []);

  const handleAnimationEnd = () => {
    if (animationState === 'closing') {
      setCurrentTask(null);
      onClose();
    }
  };

  const handleClose = () => {
    setAnimationState('closing');
    setCurrentTask(null);
    onClose();
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
      console.log('Добавленная заметка:', data);
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          text: data.text,
          created_at: data.created_at,
          note_id: data.note_id,
        },
      ]);

      onTaskUpdate();
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
    if (template !== 'deadline') {
      localDate.setHours(localDate.getHours() + 8);
    }

    return localDate.toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'title':
        return 'Название';
      case 'createdAt':
        return 'Дата создания';
      case 'updatedAt':
        return 'Дата обновления';
      case 'deadline':
        return 'Дата завершения';
      case 'status':
        return 'Статус';
      case 'priority':
        return 'Приоритет';
      case 'todo':
        return 'Сделать';
      case 'in_progress':
        return 'В процессе';
      case 'done':
        return 'Завершено';
      case 'low':
        return 'Низкий';
      case 'medium':
        return 'Средний';
      case 'high':
        return 'Высокий';
      case 'books':
        return 'Книги';
      case 'notes':
        return 'Заметки';
      case 'tags':
        return 'Теги';
      case 'note_id':
        return 'ID заметки';
      case 'text':
        return 'Текст заметки';
      case 'created_at':
        return 'Дата создания заметки';
      case 'changed_field':
        return 'Измененное поле';
      case 'change_type_display':
        return 'Тип изменения';
      case 'value':
        return 'Новое значение';
      case 'changed_at':
        return 'Дата изменения';
      case 'task_id':
        return 'ID задачи';
      case 'task':
        return 'Задача';
      case 'update':
        return 'Обновление';
      case 'delete':
        return 'Удаление';
      case 'create':
        return 'Создание';
      case 'add':
        return 'Добавление';
      case 'remove':
        return 'Удаление';
      case 'edit':
        return 'Редактирование';
      case 'content':
        return 'Содержание';
      case 'group':
        return 'Группа';
      case 'group_id':
        return 'ID группы';
      default:
        return field;
    }
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
              tags?.map((tag, index) => (
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
          {notes?.map((note, index) => (
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
        <button
  className="history-button"
  onClick={fetchHistory}
>
  История изменений
</button>

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
          onClose={() => {
            setIsEditModalOpen(false);
          }}
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
                            <span className="tag-input-class">{tag}</span>
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

      {/* Модальное окно истории изменений */}
{/* Модальное окно истории изменений */}
{isHistoryModalOpen && (
  <div className="task-details-sidebar__modal-overlay">
    <div className="task-details-sidebar__modal-content">
      <div className="task-details-sidebar__modal-header">
        <h4>История изменений</h4>
        <button
          onClick={() => setIsHistoryModalOpen(false)}
          className="task-details-sidebar__close-button"
        >
          &times;
        </button>
      </div>
      <div className="task-details-sidebar__modal-body">
        {history.length > 0 ? (
          <ul className="task-details-sidebar__history-list">
            {history.map((change, index) => (
              <li key={index} className="task-details-sidebar__history-item">
                <strong>{formatDate(change.changed_at)}</strong>
                <p>
                  Поле: <strong>{getFieldLabel(change.changed_field)}</strong><br />
                  Тип изменения: {getFieldLabel(change.change_type_display)}<br />
                  Новое значение: <em>{getFieldLabel(change.value)}</em>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет записей об изменениях.</p>
        )}
      </div>
      <div className="task-details-sidebar__modal-footer">
        <button
          onClick={() => setIsHistoryModalOpen(false)}
          className="btn btn-sm btn-outline-secondary"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
