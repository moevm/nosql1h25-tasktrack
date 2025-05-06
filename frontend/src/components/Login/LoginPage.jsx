import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { SERVER } from '../../Constants';

export default function LoginPage({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const requestBody = {
        email: email,
        password: password,
    };

    try {
      const response = await fetch(`${SERVER}/api/user/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        navigate('/tasks');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Вход</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Почтовый адрес</label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}
