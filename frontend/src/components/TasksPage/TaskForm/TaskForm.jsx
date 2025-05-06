import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
  
    e.preventDefault();
    const newTask = {
      title,
      content,
      deadline,
      status,
      priority,
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Дедлайн:</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value + 'T00:00:00')}
          />
        </div>

        <div className="form-group">
          <label>Статус:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">Сделать</option>
            <option value="in_progress">В процессе</option>
            <option value="done">Завершено</option>
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
