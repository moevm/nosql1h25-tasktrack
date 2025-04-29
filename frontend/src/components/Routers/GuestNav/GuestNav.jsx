import { Link, useLocation } from 'react-router-dom';
import './GuestNav.css';

export default function GuestNav() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <nav className="navbar-guest">
      <img src="task.png" alt="Avatar" className="avatar" />
      <div className="brand">TaskTracker</div>
      <div className="nav-center">
        <Link
          to="/login"
          className={`log_btn btn btn-link ${isLogin ? 'active-tab' : ''}`}
        >
          Вход
        </Link>
        <Link
          to="/register"
          className={`btn btn-link ${isRegister ? 'active-tab' : ''}`}
        >
          Регистрация
        </Link>
      </div>
    </nav>
  );
}
