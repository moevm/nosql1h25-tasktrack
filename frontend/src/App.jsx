import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './Dashboard';
import Settings from './Settings';
import LoginPage from './components/Login/LoginPage';
import Register from './components/Register/Register';
import GuestNav from './components/Routers/GuestNav/GuestNav';
import UserNav from './components/Routers/UserNav/UserNav';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/tasks" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}
