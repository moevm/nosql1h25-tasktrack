import { BrowserRouter as Router, Route, Routes, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import LoginPage from "./components/Login/LoginPage";
import Register from "./components/Register/Register";
import './App.css';

function GuestNav() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <nav className="navbar navbar-guest">
      <div className="brand">TaskTracker</div>
      <div className="nav-center">
        <Link
          to="/login"
          className={`btn btn-link ${isLogin ? 'active-tab' : ''}`}
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

function UserNav() {
  return (
    <nav className="navbar navbar-user">
      <span>Личный кабинет</span>
      <div>
        <Link to="/dashboard" className="btn btn-link">Профиль</Link>
        <Link to="/settings" className="btn btn-link">Настройки</Link>
        <Link to="/logout" className="btn btn-link">Выйти</Link>
      </div>
    </nav>
  );
}

function Layout({ children, isAuthenticated }) {
  return (
    <div>
      <header>
        {isAuthenticated ? <UserNav /> : <GuestNav />}
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated}>
        <Routes>
          <Route path="/" element={<div>Добро пожаловать на главную страницу!</div>} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}
