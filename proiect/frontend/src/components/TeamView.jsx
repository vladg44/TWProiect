import React, { useState, useEffect } from 'react';
import api from '../api';
import './TeamView.css';

const TeamView = ({ user, onLogout }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/managed-users');
      setTeamMembers(response.data);
      setError('');
    } catch (err) {
      setError('Eroare la încărcarea membrilor gestionați');
      console.error('Error fetching managed users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="team-loading">Se încarcă echipa...</div>;
  }

  return (
    <div className="team-view-container">
      <header className="team-header">
        <h1>Echipa Mea</h1>
        <div className="user-info">
          <span>Bună, {user.email}!</span>
          <button onClick={onLogout} className="logout-btn">Deconectare</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="team-section">
        <h2>Membrii Echipei</h2>
        {teamMembers.length === 0 ? (
          <p className="no-members">Nu aveți membri în echipă momentan.</p>
        ) : (
          <div className="team-members-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-header">
                  <h3>{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                </div>

                <div className="member-info">
                  <p className="member-email">{member.email}</p>
                  <p className="member-details">
                    ID: {member.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;