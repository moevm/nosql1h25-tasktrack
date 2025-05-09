import React, { useState, useEffect } from 'react';
import './ConnectionsModal.css'; // Стили

const ConnectionsModal = ({ task, onClose, allTasks }) => {
  const [connectionName, setConnectionName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(''); // Теперь ID задачи
  const [edges, setEdges] = useState([]);
  const SERVER = 'http://localhost:8000'; // или из констант
  const token = localStorage.getItem('token');

  // Загружаем связи задачи при монтировании компонента
  useEffect(() => {
    const fetchRelatedTasks = async () => {
      try {
        const response = await fetch(`${SERVER}/api/task/${task.taskId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Ошибка загрузки связей');
        const data = await response.json();

        // Формируем edges на основе related_to_tasks
        const relatedTasks = data.related_to_tasks.map((rel) => ({
          name: rel.title,
          connectedTask: rel.title,
          taskIdTo: rel.task_id,
        }));

        setEdges(relatedTasks);
      } catch (error) {
        console.error('Ошибка:', error);
      }
    };

    if (task?.taskId) {
      fetchRelatedTasks();
    }
  }, [task, SERVER, token]);

  // Добавить новую связь
  const handleAddConnection = async () => {
    if (!connectionName || !selectedTaskId) return;

    try {
      const response = await fetch(`${SERVER}/api/task/relationships/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id_from: task.taskId,
          task_id_to: selectedTaskId,
        }),
      });

      if (!response.ok) throw new Error('Не удалось создать связь');

      // Обновляем локальный список связей
      const newEdge = {
        name: connectionName,
        connectedTask: allTasks.find((t) => t.taskId === selectedTaskId)?.title,
      };
      setEdges([...edges, newEdge]);
      setConnectionName('');
      setSelectedTaskId('');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении связи');
    }
  };

  // Удалить существующую связь
  const handleDeleteConnection = async (index) => {
    const edgeToDelete = edges[index];
    const connectedTaskTitle = edgeToDelete.connectedTask;
    const connectedTaskId = edgeToDelete.taskIdTo;

    if (
      !window.confirm(
        `Вы уверены, что хотите удалить связь с "${connectedTaskTitle}"?`,
      )
    )
      return;

    try {
      const response = await fetch(`${SERVER}/api/task/relationships/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          task_id_from: task.taskId,
          task_id_to: connectedTaskId,
        }),
      });

      if (!response.ok) throw new Error('Не удалось удалить связь');

      // Обновляем локальный список
      const updatedEdges = [...edges];
      updatedEdges.splice(index, 1);
      setEdges(updatedEdges);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении связи');
    }
  };

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
                <div className="edge-tasks">{edge.connectedTask}</div>
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
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="">Выберите задачу</option>
              {allTasks
                .filter((t) => t.taskId !== task.taskId) // Не выбирать саму себя
                .map((t) => (
                  <option key={t.taskId} value={t.taskId}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="buttons-connection-modal">
          <button onClick={handleAddConnection}>Добавить связь</button>
          <button className="mda-close-button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
