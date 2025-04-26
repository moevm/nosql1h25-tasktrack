import React, { useState, useEffect } from "react";
import "./TaskDetailsSidebar.css";

export default function TaskDetailsSidebar({ task, onClose }) {
  const [animationState, setAnimationState] = useState('open');
  const [currentTask, setCurrentTask] = useState(task);

  useEffect(() => {
    if (task) {
      setCurrentTask(task);
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

  return (
    <div
      className={`task-details-sidebar ${animationState}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="sidebar-header">
        <h5>Информация о задаче</h5>
        <button onClick={handleClose} className="close-button">&times;</button>
      </div>
      <div className="sidebar-content">
        <p><strong>Название:</strong> {currentTask.title}</p>
        <p><strong>Описание:</strong> {currentTask.description || "Нет описания"}</p>
        <p><strong>Дата создания:</strong> {currentTask.createdAt}</p>
        <p><strong>Дата изменения:</strong> {currentTask.updatedAt}</p>
        <p><strong>Дедлайн:</strong> {currentTask.deadline}</p>
        <p><strong>Статус:</strong> {currentTask.status}</p>
        <p><strong>Приоритет:</strong> {currentTask.priority}</p>
        <p><strong>Время выполнения:</strong> {currentTask.time}</p>
      </div>
    </div>
  );
}
