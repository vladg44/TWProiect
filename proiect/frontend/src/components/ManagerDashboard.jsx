import React, { useState, useEffect } from 'react';
import api from '../api';
import './ManagerDashboard.css';

const ManagerDashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedUserId: '',
    createUnassigned: false
  });
  const [selectedExecutor, setSelectedExecutor] = useState(null);
const [executorHistory, setExecutorHistory] = useState([]);


  useEffect(() => {
    console.log('ManagerDashboard user:', user);
    console.log('API headers:', api.defaults.headers);
    fetchTasks();
    fetchTeamMembers();
  }, []);

  const fetchTasks = async () => {
    // Check if user has manager/admin role
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      setError('Acces interzis. Doar managerii și administratorii pot vedea task-urile.');
      return;
    }

    try {
      console.log('Fetching tasks...');
      const response = await api.get('/tasks');
      console.log('Tasks response:', response);
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      console.error('Error response:', err.response);
      if (err.response && err.response.status === 401) {
        setError('Eroare de autentificare. Te rugăm să te reconectezi.');
      } else {
        setError('Eroare la încărcarea task-urilor');
      }
    }
  };

  const fetchTeamMembers = async () => {
    // Check if user has manager role
    if (!user || user.role !== 'manager') {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/users/managed-users');
      setTeamMembers(response.data);
    } catch (err) {
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutorHistory = async (executorId) => {
  try {
    const res = await api.get('/tasks');

    const history = res.data.filter(t =>
      t.assignedUserId === executorId &&
      (t.status === 'COMPLETED' || t.status === 'CLOSED')
    );

    setExecutorHistory(history);
  } catch (err) {
    console.error('Eroare la istoricul executantului', err);
  }
};


  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        assignedUserId: newTask.createUnassigned ? null : newTask.assignedUserId || null
      };
      await api.post('/tasks', taskData);
      setNewTask({ title: '', description: '', dueDate: '', assignedUserId: '', createUnassigned: false });
      setShowCreateForm(false);
      fetchTasks();
    } catch (err) {
      setError('Eroare la crearea task-ului');
      console.error('Error creating task:', err);
    }
  };

  const handleAssignTask = async (taskId, userId) => {
    try {
      await api.put(`/tasks/${taskId}/assign`, { assignedUserId: userId });
      fetchTasks();
    } catch (err) {
      setError('Eroare la alocarea task-ului');
      console.error('Error assigning task:', err);
    }
  };
  const handleCloseTask = async (taskId) => {
  try {
    await api.put(`/tasks/${taskId}/close`);
    fetchTasks(); // refresh lista
  } catch (err) {
    setError('Eroare la închiderea task-ului');
    console.error('Error closing task:', err);
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
    return <div className="manager-loading">Se încarcă datele...</div>;
  }

  return (
    <div className="manager-dashboard">
      <header className="manager-header">
        <h1>Panou Manager</h1>
        <div className="user-info">
          <span>Bună, {user.email}!</span>
          <div className="debug-info">
            <small>User ID: {user.id}, Role: {user.role}</small>
          </div>
          <button onClick={onLogout} className="logout-btn">Deconectare</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-actions">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="create-task-btn"
        >
          {showCreateForm ? 'Anulează' : 'Creează Task Nou'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-task-form">
          <h3>Creează Task Nou</h3>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Titlu:</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Descriere:</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Data limită:</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newTask.createUnassigned}
                  onChange={(e) => setNewTask({
                    ...newTask,
                    createUnassigned: e.target.checked,
                    assignedUserId: e.target.checked ? '' : newTask.assignedUserId
                  })}
                />
                Creează task neasignat (starea OPEN)
              </label>
            </div>
            <div className="form-group">
              <label>Asignează la:</label>
              <select
                value={newTask.assignedUserId}
                onChange={(e) => setNewTask({...newTask, assignedUserId: e.target.value})}
                disabled={newTask.createUnassigned}
              >
                <option value="">Selectează un membru...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="submit-btn">Creează Task</button>
          </form>
        </div>
      )}

      <div className="dashboard-content">
        <div className="tasks-section">
          <h2>Toate Task-urile</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">Nu există task-uri.</p>
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
                    {task.assignedUser && (
                      <p className="task-assigned">
                        <strong>Asignat:</strong> {task.assignedUser.name} ({task.assignedUser.email})
                      </p>
                    )}
                  </div>

                  {task.status === 'OPEN' && (
                    <div className="task-actions">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTask(task.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="assign-select"
                      >
                        <option value="">Asignează unui membru...</option>
                        {teamMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {task.status === 'COMPLETED' && user.role === 'manager' && (
  <                 div className="task-actions">
                    <button
                    className="close-task-btn"
                    onClick={() => handleCloseTask(task.id)}
                    >
                    Închide task
                    </button>
                </div>
                )}

                </div>
              ))}
            </div>
          )}
        </div>

        <div className="team-section">
          <h2>Echipa Mea</h2>
          {teamMembers.length === 0 ? (
            <p className="no-members">Nu aveți membri în echipă.</p>
          ) : (
            <div className="team-members">
              {teamMembers.map((member) => (
                <div key={member.id} className="member-card">
                  <h4>{member.name}</h4>
                  <p>{member.email}</p>
                  <span className="member-role">{member.role}</span>
                </div>
              ))}
            </div>
          )}

          <h3>Istoric task-uri executant</h3>

        <select
        onChange={(e) => {
            const id = Number(e.target.value);
            setSelectedExecutor(id);
            fetchExecutorHistory(id);
        }}
        >
        <option value="">Selectează un executant...</option>
        {teamMembers.map(member => (
            <option key={member.id} value={member.id}>
            {member.name} ({member.email})
            </option>
        ))}
        </select>
        {selectedExecutor && (
  <div className="history-section">
    <h4>Istoric task-uri</h4>

    {executorHistory.length === 0 ? (
      <p>Nu există task-uri finalizate.</p>
    ) : (
      executorHistory.map(task => (
        <div key={task.id} className="task-card">
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          <span>{getStatusText(task.status)}</span>
        </div>
      ))
    )}
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;