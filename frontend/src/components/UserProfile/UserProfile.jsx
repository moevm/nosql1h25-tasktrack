import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import './UserProfile.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function UserProfile() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('');
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [taskCount, setTaskCount] = useState(120);
  const [connectionCount, setConnectionCount] = useState(200);

  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const groups = [
    { name: 'Группа A', taskCount: 120, type: 'Тип 1' },
    { name: 'Группа B', taskCount: 80, type: 'Тип 2' },
    { name: 'Группа C', taskCount: 150, type: 'Тип 3' },
  ];

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleImport = () => {
    console.log('Импортировать данные...');
  };

  const handleChangeEmail = () => {
    console.log('Изменить email...');
  };

  const handleChangePassword = () => {
    console.log('Изменить пароль...');
  };

  const handleBuildGraph = () => {
    console.log('Построить график...');
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowExportModal(false);
  };

  const handleResetGroup = () => {
    setSelectedGroup(null);
  };

  const handleExportData = () => {
    console.log(`Экспортировать данные группы: ${selectedGroup.name}`);
  };

  const chartData = {
    labels: [
      'Параметр 1',
      'Параметр 2',
      'Параметр 3',
      'Параметр 4',
      'Параметр 5',
      'Параметр 6',
      'Параметр 7',
      'Параметр 8',
      'Параметр 9',
      'Параметр 10',
      'Параметр 11',
      'Параметр 12',
      'Параметр 13',
      'Параметр 14',
      'Параметр 15',
      'Параметр 16',
      'Параметр 17',
      'Параметр 18',
      'Параметр 19',
      'Параметр 20',
    ],
    datasets: [
      {
        label: 'Данные 1',
        data: [
          12, 19, 3, 5, 10, 1, 5, 9, 15, 7, 8, 13, 4, 6, 11, 14, 9, 16, 12, 20,
        ],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="user-settings-container">
      <div className="user-settings-content">
        <div className="user-info">
          <div className="email-info">
            <p>
              Почта пользователя: <strong>{email}</strong>
            </p>
            <div className="button-group">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleChangeEmail}
              >
                Изменить почту
              </button>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={handleChangePassword}
              >
                Изменить пароль
              </button>
            </div>
          </div>
        </div>

        <div className="import-export">
          <h5>Массовый импорт/экспорт</h5>
          <div className="button-group">
            <button
              className="btn btn-sm btn-outline-success"
              onClick={handleExport}
            >
              Экспортировать данные
            </button>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={handleImport}
            >
              Импортировать данные
            </button>
          </div>
        </div>
      </div>

      <div className="statistics">
        <h5>Статистика</h5>
        <p>
          Общее количество заданий: <strong>{taskCount}</strong>
        </p>
        <p>
          Общее количество связей: <strong>{connectionCount}</strong>
        </p>

        <div className="graph-options d-flex gap-3">
          <div className="dropdown">
            <label htmlFor="x-axis">Категория по оси X</label>
            <select
              id="x-axis"
              className="form-control"
              value={selectedX}
              onChange={(e) => setSelectedX(e.target.value)}
            >
              <option value="">Выберите параметр</option>
              <option value="priority">Приоритет</option>
              <option value="status">Статус</option>
              <option value="deadline">Дата завершения</option>
            </select>
          </div>

          <div className="dropdown">
            <label htmlFor="y-axis">Категория по оси Y</label>
            <select
              id="y-axis"
              className="form-control"
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
            >
              <option value="">Выберите параметр</option>
              <option value="taskCount">Количество задач</option>
              <option value="connectionCount">Количество связей</option>
            </select>
          </div>

          <button className="btn btn-sm btn-primary" onClick={handleBuildGraph}>
            Построить график
          </button>
        </div>
      </div>

      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Выберите группу для экспорта</h5>
            <ul>
              {groups.map((group, index) => (
                <li key={index} onClick={() => handleGroupSelect(group)}>
                  <strong>{group.name}</strong> - Задания: {group.taskCount},
                  Тип: {group.type}
                </li>
              ))}
            </ul>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowExportModal(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {selectedGroup && (
        <div className="selected-group-info">
          <h5>Информация о выбранной группе</h5>
          <p>
            <strong>Группа:</strong> {selectedGroup.name}
          </p>
          <p>
            <strong>Количество заданий:</strong> {selectedGroup.taskCount}
          </p>
          <p>
            <strong>Тип группы:</strong> {selectedGroup.type}
          </p>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleResetGroup}
          >
            Сбросить
          </button>
          <button
            className="btn btn-sm btn-outline-success ml-2"
            onClick={handleExportData}
          >
            Экспортировать
          </button>
        </div>
      )}

      <div className="chart-container" style={{ marginTop: '30px' }}>
        <h5>График</h5>
        <Line data={chartData} />
      </div>
    </div>
  );
}
