import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import TaskList from './components/TaskList';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard'; // Importa componenta AdminDashboard
import QuoteOfTheDay from './components/QuoteOfTheDay';
import api from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user && user.id) {
      api.defaults.headers.common['X-User-ID'] = user.id;
    }
  }, [user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    delete api.defaults.headers.common['X-User-ID'];
  };

  const renderDashboard = () => {
    if (!user) return <LoginPage onLogin={handleLogin} />;

    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'manager':
        return <ManagerDashboard user={user} onLogout={handleLogout} />;
      case 'executor':
        return <TaskList user={user} onLogout={handleLogout} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      <QuoteOfTheDay />
      {renderDashboard()}
    </div>
  );
}

export default App;
