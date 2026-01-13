import React, { useState, useEffect } from 'react';
import api from '../api';
import './AdminDashboard.css';

// Componenta pentru modalul de editare
const EditTaskModal = ({ task, users, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...task });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Curata eroarea la modificare
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onSave(formData);
        } catch (err) {
            setError(err.response?.data?.error || 'A aparut o eroare.');
        }
    };
    
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Editează Task</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Titlu:</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Descriere:</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                     <div className="form-group">
                        <label>Data limită:</label>
                        <input type="date" name="dueDate" value={formData.dueDate ? formData.dueDate.split('T')[0] : ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Asignează la:</label>
                        <select name="assignedUserId" value={formData.assignedUserId || ''} onChange={handleChange}>
                            <option value="">Neasignat</option>
                            {users.filter(u => u.role === 'executor').map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="OPEN">OPEN</option>
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="submit">Salvează</button>
                        <button type="button" onClick={onClose}>Anulează</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('users'); // 'users' or 'tasks'
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, tasksRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/tasks') // Endpoint actualizat sa aduca si creator
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError('Eroare la preluarea datelor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeRole = async (userId, newRole, currentRole) => {
    let newManagerId = null;
    if (currentRole === 'manager' && newRole === 'executor') {
      const managerIdInput = prompt('Retrogradare la executant. Introdu ID-ul noului manager:');
      if (!managerIdInput || isNaN(managerIdInput)) {
        alert('ID invalid.');
        return;
      }
      newManagerId = parseInt(managerIdInput, 10);
    }
    try {
      await api.put(`/admin/users/${userId}/role`, { newRole, newManagerId });
      fetchData();
    } catch (err) {
        alert(err.response?.data?.error || 'Eroare la schimbarea rolului.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Sunteți sigur că doriți să ștergeți acest task?')) {
        try {
            await api.delete(`/admin/tasks/${taskId}`);
            fetchData(); // Reîmprospătează lista de task-uri
        } catch (err) {
            alert(err.response?.data?.error || 'Eroare la ștergerea task-ului.');
        }
    }
  };

  const handleUnassignManager = async (executorId) => {
    if (window.confirm('Sunteți sigur că doriți să eliberați acest executant de managerul său?')) {
        try {
            await api.put(`/admin/users/${executorId}/manager`, { newManagerId: null });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Eroare la eliberarea managerului.');
        }
    }
  };

  const handleChangeManager = async (executorId) => {
    const newManagerIdInput = prompt('Introdu ID-ul noului manager:');
    if (!newManagerIdInput || isNaN(newManagerIdInput)) {
        alert('ID-ul introdus nu este valid.');
        return;
    }
    const newManagerId = parseInt(newManagerIdInput, 10);

    try {
        await api.put(`/admin/users/${executorId}/manager`, { newManagerId });
        fetchData(); // Reincarca datele pentru a reflecta schimbarea
    } catch (err) {
        alert(err.response?.data?.error || 'Eroare la schimbarea managerului.');
    }
  };

  const handleUpdateTask = async (taskData) => {
    // Corectie: Asigura-te ca trimiti `null` in loc de string gol
    const dataToSend = { ...taskData };
    if (dataToSend.assignedUserId === '') {
        dataToSend.assignedUserId = null;
    }

    // Functia arunca o eroare mai departe pentru a fi prinsa de modal
    await api.put(`/admin/tasks/${editingTask.id}`, dataToSend);
    setEditingTask(null);
    fetchData();
  };

  const managers = users.filter(u => u.role === 'manager');
  const executors = users.filter(u => u.role === 'executor');
  
  // Grupeaza executantii pe echipe in functie de managerId
  const teams = managers.map(manager => ({
      manager,
      members: executors.filter(e => e.managerId === manager.id)
  }));
  const unassignedExecutors = executors.filter(e => !e.managerId);


  if (loading) return <div>Se încarcă...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
        {editingTask && 
            <EditTaskModal 
                task={editingTask} 
                users={users}
                onClose={() => setEditingTask(null)} 
                onSave={handleUpdateTask} 
            />
        }
      <header className="admin-header">
        <h1>Panou Administrator</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={onLogout} className="logout-btn">Deconectare</button>
        </div>
      </header>
      
      <nav className="admin-nav">
          <button onClick={() => setView('users')} className={view === 'users' ? 'active' : ''}>Utilizatori & Echipe</button>
          <button onClick={() => setView('tasks')} className={view === 'tasks' ? 'active' : ''}>Management Task-uri</button>
      </nav>

      {view === 'users' && (
        <div className="dashboard-content-grid">
          <section className="user-management">
            <h2>Management Utilizatori</h2>
            <h3>Manageri ({managers.length})</h3>
            <div className="user-list">
              {managers.map(m => (
                <div key={m.id} className="user-card">
                  <p><strong>ID: {m.id}</strong> - {m.name} ({m.email})</p>
                  <div className="user-actions">
                      <button className="role-change-btn" onClick={() => handleChangeRole(m.id, 'executor', 'manager')}>Retrogradează</button>
                  </div>
                </div>
              ))}
            </div>
            <h3>Executanți ({executors.length})</h3>
            <div className="user-list">
              {executors.map(e => (
                <div key={e.id} className="user-card">
                  <p><strong>ID: {e.id}</strong> - {e.name} ({e.email})</p>
                  <p><small>Manager: {managers.find(m => m.id === e.managerId)?.name || 'N/A'}</small></p>
                  <div className="user-actions">
                      <button className="role-change-btn" onClick={() => handleChangeRole(e.id, 'manager', 'executor')}>Promovează</button>
                      <button className="manager-change-btn" onClick={() => handleChangeManager(e.id)}>Schimbă Manager</button>
                      {e.managerId && <button className="unassign-btn" onClick={() => handleUnassignManager(e.id)}>Eliberează</button>}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="team-management">
            <h2>Echipe</h2>
            {teams.map(team => (
                <div key={team.manager.id} className="team-card">
                    <h4>Echipa lui {team.manager.name}</h4>
                    {team.members.length > 0 ? (
                        <ul>{team.members.map(m => <li key={m.id}>{m.name}</li>)}</ul>
                    ) : <p>Nu are membri.</p>}
                </div>
            ))}
            {unassignedExecutors.length > 0 && (
                <div className="team-card">
                    <h4>Executanți nealocați</h4>
                    <ul>{unassignedExecutors.map(m => <li key={m.id}>{m.name}</li>)}</ul>
                </div>
            )}
          </section>
        </div>
      )}
      
      {view === 'tasks' && (
          <section className="task-management">
              <h2>Toate Task-urile ({tasks.length})</h2>
              <div className="tasks-grid">
                  {tasks.map(task => (
                      <div key={task.id} className="task-card-admin">
                          <h3>ID: {task.id} - {task.title}</h3>
                          <p><strong>Status:</strong> {task.status}</p>
                          <p><small>Creat de: {task.creator?.name || 'N/A'}</small></p>
                          <p><small>Asignat la: {task.assignedUser?.name || 'N/A'}</small></p>
                          <div className="task-actions-admin">
                            <button onClick={() => setEditingTask(task)}>Modifică</button>
                            <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Șterge</button>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}
    </div>
  );
};

export default AdminDashboard;
