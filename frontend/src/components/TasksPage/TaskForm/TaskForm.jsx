import React, { useState } from 'react';
import './TaskForm.css';

const TaskForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- Состояние блокировки

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Название задачи обязательно';
    } else if (title.length > 50) {
      newErrors.title = 'Название не должно превышать 50 символов';
    }

    if (content.length > 500) {
      newErrors.content = 'Описание не должно превышать 500 символов';
    }

    if (deadline) {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.deadline = 'Дата завершения не может быть прошедшей';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return; // <-- Блокируем, если уже отправляется

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true); // <-- Активируем блокировку

    let formattedDeadline = null;

    if (deadline) {
      formattedDeadline = `${deadline}`;
    }

    const newTask = {
      title,
      content,
      deadline: formattedDeadline,
      status,
      priority,
      notes: [],
    };

    // Предполагается, что onSubmit — асинхронная операция (например, POST-запрос)
    // Поэтому оборачиваем в Promise или вызываем async/await
    Promise.resolve(onSubmit(newTask)).finally(() => {
      setIsSubmitting(false); // <-- Снимаем блокировку после завершения
    });
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
            maxLength={50}
            required
            disabled={isSubmitting} // <-- Блокировка полей при отправке
            className={errors.title ? 'input-error' : ''}
          />
          {errors.title && (
            <span className="error-message">{errors.title}</span>
          )}
          <div className="char-counter">{title.length}/50</div>
        </div>

        <div className="form-group">
          <label>Описание:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            disabled={isSubmitting}
            className={errors.content ? 'input-error' : ''}
          />
          {errors.content && (
            <span className="error-message">{errors.content}</span>
          )}
          <div className="char-counter">{content.length}/500</div>
        </div>

        <div className="form-group">
          <label>Дедлайн:</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={isSubmitting}
            className={errors.deadline ? 'input-error' : ''}
            required
          />
          {errors.deadline && (
            <span className="error-message">{errors.deadline}</span>
          )}
        </div>

        <div className="form-group">
          <label>Статус:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting}
          >
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
            disabled={isSubmitting}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="save-button"
            disabled={isSubmitting} // <-- Блокируем кнопку
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
