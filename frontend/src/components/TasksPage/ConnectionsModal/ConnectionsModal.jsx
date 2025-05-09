import React, { useState, useEffect } from 'react';
import './ConnectionsModal.css';

const ConnectionsModal = ({ task, onClose, allTasks }) => {
  const [connectionName, setConnectionName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Для поиска по связям

  const SERVER = 'http://localhost:8000';
  const token = localStorage.getItem('token');

  const [relatedToTasks, setRelatedToTasks] = useState([]);
  const [relatedFromTasks, setRelatedFromTasks] = useState([]);

  // Фильтрация связей по поисковому запросу
  const filteredOutgoing = relatedToTasks.filter((edge) =>
    edge.connectedTask.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredIncoming = relatedFromTasks.filter((edge) =>
    edge.connectedTask.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Загрузка связей задачи при монтировании
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

        // Исходящие связи (наши задачи)
        const relatedTo = data.related_to_tasks.map((rel) => ({
          name: rel.title,
          connectedTask: rel.title,
          taskIdTo: rel.task_id,
        }));

        // Входящие связи (чужие задачи, которые ссылаются на нас)
        const relatedFrom = data.related_from_tasks.map((rel) => ({
          name: rel.title,
          connectedTask: rel.title,
          taskIdFrom: rel.task_id,
        }));

        setRelatedToTasks(relatedTo);
        setRelatedFromTasks(relatedFrom);
      } catch (error) {
        console.error('Ошибка загрузки связей:', error);
      }
    };

    if (task?.taskId) {
      fetchRelatedTasks();
    }
  }, [task, SERVER, token]);

  // Добавить исходящую связь
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

      const addedTask = allTasks.find((t) => t.taskId === selectedTaskId);

      setRelatedToTasks([
        ...relatedToTasks,
        {
          name: connectionName,
          connectedTask: addedTask?.title || 'Без названия',
          taskIdTo: selectedTaskId,
        },
      ]);

      setConnectionName('');
      setSelectedTaskId('');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении связи');
    }
  };

  // Удалить исходящую связь
  const handleDeleteOutgoing = async (index) => {
    const edgeToDelete = filteredOutgoing[index];

    if (!window.confirm(`Удалить связь с "${edgeToDelete.connectedTask}"?`))
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
          task_id_to: edgeToDelete.taskIdTo,
        }),
      });

      if (!response.ok) throw new Error('Не удалось удалить исходящую связь');

      const updatedEdges = relatedToTasks.filter(
        (e) => e.taskIdTo !== edgeToDelete.taskIdTo,
      );
      setRelatedToTasks(updatedEdges);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении исходящей связи');
    }
  };

  // Удалить входящую связь (если разрешено бэкендом)
  const handleDeleteIncoming = async (index) => {
    const edgeToDelete = filteredIncoming[index];

    if (
      !window.confirm(
        `Удалить входящую связь от "${edgeToDelete.connectedTask}"?`,
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
          task_id_from: edgeToDelete.taskIdFrom,
          task_id_to: task.taskId,
        }),
      });

      if (!response.ok) throw new Error('Не удалось удалить входящую связь');

      const updatedEdges = relatedFromTasks.filter(
        (e) => e.taskIdFrom !== edgeToDelete.taskIdFrom,
      );
      setRelatedFromTasks(updatedEdges);
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении входящей связи');
    }
  };

  return (
    <div className="connections-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <h3>Связи задачи: {task.title}</h3>

        {/* Поиск по связям */}
        <div className="form-group mb-3">
          <label>Поиск по связям:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Введите название задачи..."
            className="form-control"
          />
        </div>

        {/* Исходящие связи */}
        <h4>Исходящие связи</h4>
        <ul className="edges-list">
          {filteredOutgoing.length > 0 ? (
            filteredOutgoing.map((edge, index) => (
              <li key={`out-${index}`} className="edge-item">
                <div className="edge-header">
                  <div className="edge-name" title={edge.name}>
                    {edge.name}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteOutgoing(index)}
                  >
                    ❌
                  </button>
                </div>
                <div className="edge-tasks">{edge.connectedTask}</div>
              </li>
            ))
          ) : (
            <li>Нет исходящих связей</li>
          )}
        </ul>

        {/* Входящие связи */}
        <h4>Входящие связи</h4>
        <ul className="edges-list">
          {filteredIncoming.length > 0 ? (
            filteredIncoming.map((edge, index) => (
              <li key={`in-${index}`} className="edge-item">
                <div className="edge-header">
                  <div className="edge-name" title={edge.name}>
                    {edge.name}
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteIncoming(index)}
                  >
                    ❌
                  </button>
                </div>
                <div className="edge-tasks">
                  Задача "{edge.connectedTask}" ссылается на эту
                </div>
              </li>
            ))
          ) : (
            <li>Нет входящих связей</li>
          )}
        </ul>

        {/* Форма для добавления исходящей связи */}
        <h4>Добавить новую исходящую связь</h4>
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
