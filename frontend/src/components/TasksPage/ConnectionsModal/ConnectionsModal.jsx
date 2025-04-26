import React, { useState } from 'react';
import './ConnectionsModal.css'; // Стили

const ConnectionsModal = ({ task, onClose, onAddConnection, allTasks, onDeleteConnection }) => {
  const [connectionName, setConnectionName] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  const handleAddConnection = () => {
    if (connectionName && selectedTask) {
      onAddConnection(connectionName, selectedTask);
      setConnectionName('');
      setSelectedTask('');
    }
  };

  const handleDeleteConnection = (index) => {
    if (window.confirm('Вы уверены, что хотите удалить эту связь?')) {
      onDeleteConnection(index);
    }
  };

  const edges = Array.isArray(task?.edges) ? task.edges : [];

  return (
    <div className="connections-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <h3>Связи задачи: {task.title}</h3>

        <h4>Существующие связи</h4>
        <ul className="edges-list">
          {edges.length > 0 ? (
            edges.map((edge, index) => (
              <li key={index} className="edge-item">
                <div className="edge-header">
                  <div className="edge-name" title={edge.name}>
                    {edge.name}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteConnection(index)}
                  >
                    ❌
                  </button>
                </div>
                <div className="edge-tasks">
                  {edge .connectedTask}
                </div>
              </li>
            ))
          ) : (
            <li>Нет связей</li>
          )}
        </ul>

        <h4>Добавить новую связь</h4>
        <div className="form-group">
          <label>Название связи:</label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Выберите задачу:</label>
          <div className="select-wrapper">
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">Выберите задачу</option>
              {allTasks.map((task) => (
                <option key={task.title} value={task.title}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="buttons-connection-modal">
          <button onClick={handleAddConnection}>Добавить связь</button>
          <button className="mda-close-button" onClick={onClose}>Закрыть</button>
        </div> 
      </div>
    </div>
  );
};

export default ConnectionsModal;
