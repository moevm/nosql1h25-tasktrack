// Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Register.css'; 

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = () => {
    console.log("Email:", email);
    console.log("Password:", password);
    navigate("/login");
  };

  return (
    <div className="main-content">
      <h1>Регистрация</h1>
      <div className="form-group">
        <label htmlFor="email">Электронная почта</label>
        <input
          type="email"
          id="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введите ваш email"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Пароль</label>
        <input
          type="password"
          id="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите ваш пароль"
        />
      </div>
      <button className="btn btn-primary" onClick={handleRegister}>
        Зарегистрироваться
      </button>
    </div>
  );
}
