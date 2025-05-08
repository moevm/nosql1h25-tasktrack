import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { SERVER } from '../../Constants';
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
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
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
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
          />
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            required
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">Успешная регистрация!</p>}

          <button type="submit">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  );
}
