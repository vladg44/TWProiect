import React, { useState } from 'react';
import './LoginPage.css';
import api from '../api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    // Apelam API-ul de autentificare
    api.post('/auth/login', { email, password })
      .then((res) => {
        const user = res.data.user;
        // Salvam user si user id in localStorage si setam header-ul pentru viitoarele cereri
        localStorage.setItem('userId', user.id);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['X-User-ID'] = user.id;
        setError('');
        onLogin(user);
      })
      .catch((err) => {
        console.error('Login error', err?.response?.data || err.message);
        const msg = err?.response?.data?.error || 'Login failed';
        setError(msg);
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
