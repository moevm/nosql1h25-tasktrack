import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import LoginPage from './components/Login/LoginPage';
import Register from './components/Register/Register';
import GuestNav from './components/Routers/GuestNav/GuestNav';
import UserNav from './components/Routers/UserNav/UserNav';
import PrivateRoute from './PrivateRoute';
import UserProfile from './components/UserProfile/UserProfile';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  function Layout({ children }) {
    return (
      <div>
        <header>
          {isAuthenticated ? <UserNav setToken={setToken} /> : <GuestNav />}
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/tasks' : '/login'} />}
          />
          <Route path="/login" element={<LoginPage setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tasks"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <UserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isAuthenticated ? '/tasks' : '/login'} replace />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
