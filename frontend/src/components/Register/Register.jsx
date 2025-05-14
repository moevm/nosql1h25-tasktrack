import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { SERVER } from '../../Constants';

export default function Register({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    const requestBody = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch(`${SERVER}/api/user/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setSuccess(true);
        navigate('/tasks');
      } else {
        const errorData = await response.json();
        console.error('Ошибка при выполнении запроса:', errorData);

        if (typeof errorData === 'object') {
          if ('email' in errorData) {
            if (errorData.email[0] === 'Enter a valid email address.') {
              setError('Неверный формат электронной почты');
              return;
            }
            if (errorData.email[0] === 'User with this email already exists') {
              setError('Электронная почта уже зарегистрирована');
              return;
            }
          }
          if ('password' in errorData) {
            if (errorData.password[0] === 'Ensure this field has at least 8 characters.') {
              setError('Пароль должен содержать минимум 8 символов');
              return;
            }
          }
        } else {
          setError(errorData.detail || 'Ошибка регистрации');
        }
      }
    } catch (err) {
      console.error('Ошибка при выполнении запроса:', err);
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="email">Электронная почта</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введите ваш email"
            required
            disabled={isLoading}
          />
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            required
            disabled={isLoading} 
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">Успешная регистрация!</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>

          {/* Индикатор загрузки */}
          {isLoading && <div className="loading-indicator">Пожалуйста, подождите...</div>}
        </form>
      </div>
    </div>
  );
}