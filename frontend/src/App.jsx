import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { useState } from "react";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import LoginPage from "./components/Login/LoginPage";
import Register from "./components/Register/Register";
import './App.css';
import GuestNav from "./components/Routers/GuestNav/GuestNav";
import UserNav from "./components/Routers/UserNav/UserNav";




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
