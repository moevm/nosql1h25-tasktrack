import { Link } from "react-router-dom";
import './UserNav.css'

export default function UserNav() {
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