import React, { useState, useEffect } from 'react';
import './TaskDetailsSidebar.css';

export default function TaskDetailsSidebar({ task, onClose }) {
  const [animationState, setAnimationState] = useState('open');
  const [currentTask, setCurrentTask] = useState(task);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState(task?.status || '');
  const [priority, setPriority] = useState(task?.priority || '');

  useEffect(() => {
    if (task) {
      setCurrentTask(task);
      setStatus(task.status);
      setPriority(task.priority);
      setAnimationState('open');
    } else if (!task && currentTask) {
      setAnimationState('closing');
    }
  }, [task]);

  const handleAnimationEnd = () => {
    if (animationState === 'closing') {
      setCurrentTask(null);
      onClose();
    }
  };

  if (!currentTask) return null;

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

  const handleEditNote = (index, editedText) => {
    const updatedNotes = [...notes];
    updatedNotes[index] = editedText;
    setNotes(updatedNotes);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
  };

  return (
    <div
      className={`task-details-sidebar ${animationState}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="status-priority-container">
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
        <h3>{currentTask.title}</h3>
        <p>{currentTask.description || 'Нет описания'}</p>
        <div className="additional-info">
          <span>Дата изменения: {currentTask.updatedAt}</span>
          <span>Дата создания: {currentTask.createdAt}</span>
          <span>Дата завершения: {currentTask.deadline}</span>
        </div>
      </div>

      <h4 className="notes-label">Заметки</h4>
      <div className="notes-section">
        <div className="notes-list">
          {notes.map((note, index) => (
            <div key={index} className="note-card">
              <p>{note}</p>
              <div className="note-actions">
                <button
                  className="edit-button"
                  onClick={() =>
                    handleEditNote(index, prompt('Введите новый текст:', note))
                  }
                >
                  Изменить
                </button>
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

      <div className="footer-buttons">
        <button className="edit-button">Редактировать</button>
        <button className="delete-button">Удалить</button>
        <button className="add-note-button" onClick={handleAddNote}>
          Добавить заметку
        </button>
        <button className="history-button">История изменений</button>
      </div>
    </div>
  );
}
