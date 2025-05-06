import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [completedAt, setCompletedAt] = useState('');

  const handleSubmit = (e) => {
    const today = new Date();

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    e.preventDefault();
    const newTask = {
      title,
      description,
      deadline,
      status,
      priority,
      completedAt,
      createdAt: formattedDate,
      updatedAt: formattedDate,
      notes: [],
    };
    onSubmit(newTask);
  };

  return (
    <div className="modal-overlay">
      <form className="task-form" onSubmit={handleSubmit}>
        <h2>Создать новую задачу</h2>

        <div className="form-group">
          <label>Название задачи:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Описание:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Дедлайн:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Статус:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Ожидает</option>
            <option value="in_progress">В процессе</option>
            <option value="completed">Завершено</option>
          </select>
        </div>

        <div className="form-group">
          <label>Приоритет:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div className="form-group">
          <label>Дата завершения:</label>
          <input
            type="date"
            value={completedAt}
            onChange={(e) => setCompletedAt(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            Сохранить
          </button>
          <button type="button" onClick={onCancel} className="cancel-button">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
