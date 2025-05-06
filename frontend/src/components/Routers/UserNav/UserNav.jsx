import { Link, useNavigate } from 'react-router-dom';
import './UserNav.css';

export default function UserNav({ setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(false); 
    navigate('/login'); 
  };

  return (
    <div className="navbar-user">
      <img src="task.png" alt="Avatar" className="avatar" />
      <div className="brand">TaskTracker</div>
      <div className="nav-center-user">
        <Link to="/tasks" className="btn btn-link-user">
          Задания
        </Link>
        <Link to="/profile" className="btn btn-link-user">
          Моя страница
        </Link>
        <button onClick={handleLogout} className="btn btn-link-user">
          Выйти
        </button>
      </div>
    </div>
  );
}
