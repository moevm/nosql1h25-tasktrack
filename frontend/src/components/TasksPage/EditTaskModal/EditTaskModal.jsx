import React, { useState, useEffect } from 'react';
import './EditTaskModal.css';
import { SERVER } from '../../../Constants';

export default function EditTaskModal({ task, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.content || '');
      setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    }
  }, [task]);

  const validate = () => {
    const newErrors = {};
    const now = new Date();
    const deadlineDate = new Date(deadline);

    if (!title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (title.length > 50) {
      newErrors.title = 'Название должно быть не более 50 символов';
    }

    if (description.length > 500) {
      newErrors.description = 'Описание должно быть не более 500 символов';
    }

    if (deadline && deadlineDate < now.setHours(0, 0, 0, 0)) {
      newErrors.deadline = 'Дедлайн не может быть в прошлом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SERVER}/api/task/${task.task_id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: description,
          deadline: `${deadline}T23:59:59`,
        }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении задачи');

      const updatedTask = await response.json();
      onSave(updatedTask); // Передаем обновленную задачу обратно
      onClose();
    } catch (error) {
      console.error(error);
      alert('Не удалось сохранить изменения');
    }
  };

  return (
    <div className="modal-overlay-edit-task" onClick={onClose}>
      <div className="modal-content-edit-task" onClick={(e) => e.stopPropagation()}>
        <h3>Редактировать задачу</h3>

        <label>
          Название:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <span className="error-message-edit-task">{errors.title}</span>
          )}
        </label>

        <label>
          Описание:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <span className="error-message-edit-task">{errors.description}</span>
          )}
        </label>

        <label>
          Дедлайн:
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          {errors.deadline && (
            <span className="error-message-edit-task">{errors.deadline}</span>
          )}
        </label>

        <div className="modal-actions-edit-task">
          <button onClick={handleSubmit}>Сохранить</button>
          <button onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
}
