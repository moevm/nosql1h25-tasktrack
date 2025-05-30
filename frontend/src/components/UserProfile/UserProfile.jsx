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
const [isLoading, setIsLoading] = useState(false); // Для индикации загрузки
const [importResult, setImportResult] = useState(null); // Результат импорта

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
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert('Файл не выбран');

    if (!file.name.endsWith('.json')) {
      return alert('Пожалуйста, выберите JSON-файл');
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('restore_file', file);

    try {
      // Читаем файл для подсчёта объектов и отправки
      const fileText = await file.text();

      let jsonData;
      try {
        jsonData = JSON.parse(fileText);
      } catch (e) {
        throw new Error('Файл содержит некорректный JSON.');
      }

      // Подсчёт примерного количества объектов
      const countObjects = (obj) => {
        if (Array.isArray(obj)) {
          return obj.reduce((sum, item) => sum + countObjects(item), 0);
        } else if (typeof obj === 'object' && obj !== null) {
          return 1 + Object.values(obj).reduce((sum, val) => sum + countObjects(val), 0);
        }
        return 0;
      };

      const total_objects = countObjects(jsonData);

      // Устанавливаем статус "загрузка"
      setIsLoading(true);
      setImportResult(null);

      const start = Date.now(); // Начинаем отсчёт времени

      // Отправляем данные
      const response = await fetch(`${SERVER}/api/database/dump/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const duration = ((Date.now() - start) / 1000).toFixed(2); // Время в секундах

      if (!response.ok) {
        throw new Error('Ошибка сервера при импорте данных');
      }

      // Сохраняем результат
      setImportResult({
        success: true,
        count: total_objects,
        time: duration,
      });
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || 'Не удалось загрузить файл.',
      });
    } finally {
      setIsLoading(false); // Скрываем индикатор загрузки
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
      {/* Индикатор загрузки */}
{isLoading && (
  <div className="modal-overlay-user">
    <div className="loading-modal">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </div>
      <p>Идёт загрузка данных...</p>
    </div>
  </div>
)}

{/* Модальное окно результата */}
{importResult && (
  <div className="modal-overlay-user">
    <div className="result-modal">
      {importResult.success ? (
        <>
          <h5>✅ Импорт успешно завершён</h5>
          <p>Добавлено объектов: <strong>{importResult.count}</strong></p>
          <p>Время импорта: <strong>{importResult.time} сек.</strong></p>
          <button
        className="btn btn-primary mt-3"
        onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}
      >
        ОК
      </button>
        </>
      ) : (
        <>
          <h5>❌ Ошибка импорта</h5>
          <p>{importResult.message}</p>
          <button
        className="btn btn-primary mt-3"
        onClick={() => {
          setImportResult(null)
        }}
      >
        ОК
      </button>
        </>
      )}
      
    </div>
  </div>
)}
    </div>
  );
}
