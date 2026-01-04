import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {user ? (
        // Daca utilizatorul este logat, afiseaza un ecran de bun venit
        <div className="welcome-container">
          <h1>Welcome, {user.email}!</h1>
          <p>You are now logged in.</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        // Daca nu, afiseaza pagina de login
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
