import React, { useState, useEffect } from 'react';
import './ConnectionsModal.css';
import { SERVER } from '../../../Constants';

const ConnectionsModal = ({ task, onClose, allTasks }) => {
  const [connectionName, setConnectionName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [searchOutgoing, setSearchOutgoing] = useState(''); // текст поиска исходящих
  const [searchIncoming, setSearchIncoming] = useState(''); // текст поиска входящих
  const [searchModeOutgoing, setSearchModeOutgoing] = useState('task'); // task / name
  const [searchModeIncoming, setSearchModeIncoming] = useState('task');

  const token = localStorage.getItem('token');
  const [relatedToTasks, setRelatedToTasks] = useState([]);
  const [relatedFromTasks, setRelatedFromTasks] = useState([]);

  // Загрузка связей
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

        // Исходящие связи
        const relatedTo = data.related_to_tasks.map((rel) => ({
          name: rel.relationship?.title || rel.title,
          connectedTask: rel.title,
          taskIdTo: rel.task_id,
        }));

        // Входящие связи
        const relatedFrom = data.related_from_tasks.map((rel) => ({
          name: rel.relationship?.title || rel.title,
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

  // Фильтрация связей по режиму поиска
  const filteredOutgoing = relatedToTasks.filter((edge) => {
    const searchLower = searchOutgoing.toLowerCase();
    if (searchModeOutgoing === 'task') {
      return edge.connectedTask.toLowerCase().includes(searchLower);
    } else {
      return edge.name.toLowerCase().includes(searchLower);
    }
  });

  const filteredIncoming = relatedFromTasks.filter((edge) => {
    const searchLower = searchIncoming.toLowerCase();
    if (searchModeIncoming === 'task') {
      return edge.connectedTask.toLowerCase().includes(searchLower);
    } else {
      return edge.name.toLowerCase().includes(searchLower);
    }
  });

  // Добавить новую связь
  const handleAddConnection = async () => {
    if (!connectionName) {
      alert('Введите название связи');
      return;
    }
    if (!selectedTaskId) {
      alert('Выберите задачу для связи');
      return;
    }

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
          title: connectionName,
        }),
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }

        const errorMessage = errorData.error;
        if (
          errorMessage === 'Creating a link will result in a cyclic dependency'
        ) {
          alert('Создание связи приведет к циклической зависимости');
        } else if (errorMessage === 'Task is already related') {
          alert('Связь уже существует');
        } else {
          alert('Не удалось создать связь');
        }

        return;
      }

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

  // Удаление исходящей связи
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

  // Удаление входящей связи
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
    <div className="cm-modal">
      <div className="cm-overlay" onClick={onClose}></div>
      <div className="cm-content">
        <h3>Связи задачи: {task.title}</h3>

        {/* Блок поиска */}
        <div className="cm-search-boxes-row">
          {/* Поиск исходящих */}
          <div className="cm-form-group cm-mb-3">
            <label>Поиск исходящих:</label>
            <input
              type="text"
              value={searchOutgoing}
              onChange={(e) => setSearchOutgoing(e.target.value)}
              placeholder={
                searchModeOutgoing === 'task'
                  ? 'По названию задачи'
                  : 'По названию связи'
              }
              className="cm-form-control cm-word-break"
            />
            <select
              value={searchModeOutgoing}
              onChange={(e) => setSearchModeOutgoing(e.target.value)}
              className="cm-form-control mt-1"
            >
              <option value="task">По названию задачи</option>
              <option value="name">По названию связи</option>
            </select>
          </div>

          {/* Поиск входящих */}
          <div className="cm-form-group cm-mb-3">
            <label>Поиск входящих:</label>
            <input
              type="text"
              value={searchIncoming}
              onChange={(e) => setSearchIncoming(e.target.value)}
              placeholder={
                searchModeIncoming === 'task'
                  ? 'По названию задачи'
                  : 'По названию связи'
              }
              className="cm-form-control cm-word-break"
            />
            <select
              value={searchModeIncoming}
              onChange={(e) => setSearchModeIncoming(e.target.value)}
              className="cm-form-control mt-1"
            >
              <option value="task">По названию задачи</option>
              <option value="name">По названию связи</option>
            </select>
          </div>
        </div>

        {/* Колонки: исходящие + входящие */}
        <div className="cm-two-column-layout">
          {/* Левый столбец: исходящие */}
          <div className="cm-column cm-outgoing">
            <h4>Исходящие связи</h4>
            <ul className="cm-edges-list">
              {filteredOutgoing.length > 0 ? (
                filteredOutgoing.map((edge, index) => (
                  <li key={`out-${index}`} className="cm-edge-item">
                    <div className="cm-edge-header">
                      <div className="cm-edge-name" title={edge.name}>
                        {edge.name}
                      </div>
                      <button
                        className="cm-delete-button"
                        onClick={() => handleDeleteOutgoing(index)}
                      >
                        ❌
                      </button>
                    </div>
                    <div className="cm-edge-tasks">{edge.connectedTask}</div>
                  </li>
                ))
              ) : (
                <li>Нет исходящих связей</li>
              )}
            </ul>
          </div>

          {/* Правый столбец: входящие */}
          <div className="cm-column cm-incoming">
            <h4>Входящие связи</h4>
            <ul className="cm-edges-list">
              {filteredIncoming.length > 0 ? (
                filteredIncoming.map((edge, index) => (
                  <li key={`in-${index}`} className="cm-edge-item">
                    <div className="cm-edge-header">
                      <div className="cm-edge-name" title={edge.name}>
                        {edge.name}
                      </div>
                      <button
                        className="cm-delete-button"
                        onClick={() => handleDeleteIncoming(index)}
                      >
                        ❌
                      </button>
                    </div>
                    <div className="cm-edge-tasks">
                      Задача "{edge.connectedTask}" ссылается на эту
                    </div>
                  </li>
                ))
              ) : (
                <li>Нет входящих связей</li>
              )}
            </ul>
          </div>
        </div>

        {/* Форма для добавления связи */}
        <h4>Добавить новую исходящую связь</h4>
        <div className="cm-form-group">
          <label>Название связи:</label>
          <input
            type="text"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="Введите название связи..."
            maxLength={20}
            className="cm-form-control cm-word-break"
          />
        </div>

        <div className="cm-form-group">
          <label>Выберите задачу:</label>
          <div className="cm-select-wrapper">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="">Выберите задачу</option>
              {allTasks
                .filter((t) => t.taskId !== task.taskId)
                .map((t) => (
                  <option key={t.taskId} value={t.taskId}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="cm-buttons-modal">
          <button onClick={handleAddConnection}>Добавить связь</button>
          <button className="cm-close-button-settings" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
