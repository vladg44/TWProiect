import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import api from '../api';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('executor');
  const [managerIdInput, setManagerIdInput] = useState('');
  const [managers, setManagers] = useState([]);

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

  const handleSignup = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please enter name, email and password for signup.');
      return;
    }
    const payload = { name, email, password, role };
    if (role === 'executor' && managerIdInput) payload.managerId = Number(managerIdInput);

    api.post('/auth/register', payload)
      .then((res) => {
        const user = res.data.user;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('user', JSON.stringify(user));
        api.defaults.headers.common['X-User-ID'] = user.id;
        setError('');
        setShowSignup(false);
        onLogin(user);
      })
      .catch((err) => {
        console.error('Signup error', err?.response?.data || err.message);
        const msg = err?.response?.data?.error || 'Signup failed';
        setError(msg);
      });
  };

  useEffect(() => {
    if (!showSignup) return;
    // fetch list of managers for the select
    api.get('/auth/managers')
      .then((res) => {
        setManagers(res.data.managers || []);
      })
      .catch((err) => {
        console.error('Failed to fetch managers', err?.response?.data || err.message);
      });
  }, [showSignup]);

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>{showSignup ? 'Sign Up' : 'Login'}</h2>
        {error && <p className="error-message">{error}</p>}
        {showSignup && (
          <>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="executor">Executor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {role === 'executor' && (
              <div className="form-group">
                <label htmlFor="managerId">Manager (optional):</label>
                <select id="managerId" value={managerIdInput} onChange={(e) => setManagerIdInput(e.target.value)}>
                  <option value="">-- None --</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
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
        <div className="button-row">
          <button type="submit">{showSignup ? 'Login' : 'Login'}</button>
          <button type="button" onClick={() => setShowSignup(s => !s)}>
            {showSignup ? 'Cancel' : 'Sign Up'}
          </button>
        </div>
        {showSignup && (
          <div className="signup-submit">
            <button type="button" onClick={handleSignup}>Create account</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
