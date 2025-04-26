import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import Settings from './Settings';
import LoginPage from './components/Login/LoginPage';
import Register from './components/Register/Register';
import GuestNav from './components/Routers/GuestNav/GuestNav';
import UserNav from './components/Routers/UserNav/UserNav';
import PrivateRoute from './PrivateRoute';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  function Layout({ children, isAuthenticated }) {
    return (
      <div>
        <header>
          {isAuthenticated ? (
            <UserNav setIsAuthenticated={setIsAuthenticated} />
          ) : (
            <GuestNav />
          )}
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <Router>
      <Layout isAuthenticated={isAuthenticated}>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Settings />
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
