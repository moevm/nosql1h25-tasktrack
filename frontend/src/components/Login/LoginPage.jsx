import { useNavigate } from "react-router-dom";
import React from 'react';
import './LoginPage.css';

export default function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Вход</h2>
        <form>
          <label htmlFor="email">Почтовый адрес</label>
          <input type="email" id="email" placeholder="you@example.com" />

          <label htmlFor="password">Пароль</label>
          <input type="password" id="password" placeholder="Введите пароль" />

          <button type="submit" onClick={handleLogin}>Войти</button>
        </form>
      </div>
    </div>
  );
};
