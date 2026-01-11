import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import TaskList from './components/TaskList';
import ManagerDashboard from './components/ManagerDashboard';
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

  return (
    <div className="App">
      {user ? (
        // Daca utilizatorul este logat, afiseaza continutul potrivit rolului
        user.role === 'executor' ? (
          <TaskList user={user} onLogout={handleLogout} />
        ) : (
          // Pentru manageri si admini, afiseaza panoul manager
          <ManagerDashboard user={user} onLogout={handleLogout} />
        )
      ) : (
        // Daca nu, afiseaza pagina de login
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
