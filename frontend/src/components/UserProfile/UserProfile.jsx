import React, { useState, useEffect } from 'react';
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
import { SERVER } from '../../Constants.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Ошибка при разборе JWT', e);
    return null;
  }
}

export default function UserProfile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedX, setSelectedX] = useState('');
  const [selectedY, setSelectedY] = useState('');
  const [taskCount, setTaskCount] = useState(120);
  const [connectionCount, setConnectionCount] = useState(200);
  const [notification, setNotification] = useState('');

  const groups = [
    { name: 'Группа A', taskCount: 120, type: 'Тип 1' },
    { name: 'Группа B', taskCount: 80, type: 'Тип 2' },
    { name: 'Группа C', taskCount: 150, type: 'Тип 3' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.email) {
        setEmail(decoded.email);
      } else {
        setEmail('Неизвестный пользователь');
      }
    } else {
      setEmail('Токен отсутствует');
    }
  }, []);

  const handleExport = () => {
    const token = localStorage.getItem('token');
    fetch(`${SERVER}/api/database/dump/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        return response.json();
      })
      .then((data) => {
        const jsonString = JSON.stringify(data, null, 2);

        const blob = new Blob([jsonString], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'database_dump.json';
        link.click();
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Ошибка экспорта:', error);
        alert('Не удалось загрузить данные.');
      });
  };

  const handleImport = () => {
    const token = localStorage.getItem('token');

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return alert('Файл не выбран');

      if (!file.name.endsWith('.json')) {
        return alert('Пожалуйста, выберите JSON-файл');
      }

      const formData = new FormData();
      formData.append('restore_file', file);

      try {
        const response = await fetch(`${SERVER}/api/database/dump/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Импорт успешен:', result);

        // Установка уведомления
        setNotification('Данные успешно загружены.');

        // Очистка токена
        localStorage.removeItem('token');

        // Отображение уведомления на 3 секунды, затем редирект
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить файл');
      }
    };

    input.click();
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
      {/* Уведомление */}
      {notification && (
        <div className="notification-toast show">{notification}</div>
      )}

      <div className="user-settings-content">
        <div className="user-info">
          <div className="email-info">
            <p>
              Почта пользователя: <strong>{email}</strong>
            </p>
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

      <div className="chart-container" style={{ marginTop: '30px' }}>
        <h5>График</h5>
        <Line data={chartData} />
      </div>
    </div>
  );
}