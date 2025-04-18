import { useNavigate } from "react-router-dom";

export default function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Имитируем успешный вход
    setIsAuthenticated(true);  // меняем состояние на "вошел"
    navigate("/dashboard");
  };

  return (
    <div className="main-content">
      <h1>Вход в систему</h1>
      <p>Введите данные для входа (пока просто кнопка 😅)</p>
      <button className="login-btn" onClick={handleLogin}>
        Подтвердить вход
      </button>
    </div>
  );
}
