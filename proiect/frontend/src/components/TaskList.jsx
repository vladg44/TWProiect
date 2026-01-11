import React, { useState, useEffect } from 'react';
import api from '../api';
import './TaskList.css';

const TaskList = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [manager, setManager] = useState(null);

  
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchTasks();
    // când se schimbă userul, resetăm istoricul din UI 
    setShowHistory(false);
    setHistory([]);
  }, [user.id]);

  useEffect(() => {
    if (user.managerId) {
      fetchManager();
    } else {
      setManager(null);
    }
  }, [user.managerId]);

  const fetchManager = async () => {
    try {
      const response = await api.get(`/users/${user.managerId}`);
      setManager(response.data);
    } catch (err) {
      console.error('Error fetching manager:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/user/${user.id}`);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Eroare la încărcarea task-urilor');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchHistory = async () => {
    try {
      const res = await api.get(`/tasks/user/${user.id}`);

      const hist = res.data.filter(
        (t) => t.status === 'COMPLETED' || t.status === 'CLOSED'
      );

      setHistory(hist);
    } catch (err) {
      console.error('Eroare la încărcarea istoricului', err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/complete`);
      // Reîncarcă task-urile după completare
      fetchTasks();

      // dacă istoricul e deschis, îl actualizăm și pe el 
      if (showHistory) fetchHistory();
    } catch (err) {
      setError('Eroare la marcarea task-ului ca finalizat');
      console.error('Error completing task:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#ffa726';
      case 'PENDING': return '#42a5f5';
      case 'COMPLETED': return '#66bb6a';
      case 'CLOSED': return '#26a69a';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'OPEN': return 'Deschis';
      case 'PENDING': return 'În așteptare';
      case 'COMPLETED': return 'Finalizat';
      case 'CLOSED': return 'Închis';
      default: return status;
    }
  };

  if (loading) {
    return <div className="task-list-loading">Se încarcă task-urile...</div>;
  }

  return (
    <div className="task-list-container">
      <header className="task-list-header">
        <div className="title-section">
          <h1>Task-urile Mele</h1>
          {manager && (
            <p className="manager-name">Manager: {manager.name}</p>
          )}
        </div>
        <div className="user-info">
          <span>Bună, {user.email}!</span>
          <button onClick={onLogout} className="logout-btn">Deconectare</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-section">
        {/* header with history toggle button */}
        <div className="tasks-section-header">
          <h2>Lista Task-uri</h2>

          <button
            className="history-toggle-btn"
            onClick={() => {
              const next = !showHistory;
              setShowHistory(next);
              if (!showHistory) fetchHistory();
            }}
          >
            {showHistory ? 'Ascunde istoric' : 'Vezi istoric'}
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="no-tasks">Nu aveți task-uri momentan.</p>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span
                    className="task-status"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {getStatusText(task.status)}
                  </span>
                </div>

                <div className="task-content">
                  <p className="task-description">{task.description}</p>
                  {task.dueDate && (
                    <p className="task-due-date">
                      <strong>Data limită:</strong> {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                    </p>
                  )}
                </div>

                <div className="task-actions">
                  {task.status === 'PENDING' && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="complete-btn"
                    >
                      Marchează ca Finalizat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/*  history section below */}
        {showHistory && (
          <div className="history-section">
            <h2>Istoric Task-uri</h2>

            {history.length === 0 ? (
              <p className="no-tasks">Nu aveți task-uri în istoric.</p>
            ) : (
              <div className="tasks-grid">
                {history.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span
                        className="task-status"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {getStatusText(task.status)}
                      </span>
                    </div>

                    <div className="task-content">
                      <p className="task-description">{task.description}</p>
                      {task.dueDate && (
                        <p className="task-due-date">
                          <strong>Data limită:</strong> {new Date(task.dueDate).toLocaleDateString('ro-RO')}
                        </p>
                      )}
                    </div>

                    {/* în istoric nu punem buton de complete */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
