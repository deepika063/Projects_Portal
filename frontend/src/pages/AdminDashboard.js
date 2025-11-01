import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPendingFaculty();
  }, []);

  const loadPendingFaculty = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingFaculty();
      setPendingFaculty(response.data.data || []);
    } catch (error) {
      setMessage('Error loading pending faculty');
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const approveFaculty = async (userId) => {
    try {
      const response = await adminAPI.approveFaculty(userId);
      setMessage(`✅ Faculty ${response.data.data.username} approved successfully!`);
      loadPendingFaculty(); // Reload the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error approving faculty');
    }
  };

  const rejectFaculty = async (userId) => {
    try {
      const response = await adminAPI.rejectFaculty(userId);
      setMessage(`❌ Faculty ${response.data.data.username} rejected.`);
      loadPendingFaculty(); // Reload the list
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error rejecting faculty');
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Projects Portal - Admin</h1>
          <div className="nav-links">
            <span>Welcome, {user?.username}</span>
            <button onClick={logout} className="btn btn-danger">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>👥 Faculty Approval Requests</h2>
            <p>Review and approve faculty registration requests</p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <p>Loading faculty requests...</p>
            </div>
          ) : pendingFaculty.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>All Clear!</h3>
              <p>No pending faculty approval requests at this time.</p>
              <p>New faculty registrations will appear here for review.</p>
            </div>
          ) : (
            <div className="faculty-approval-list">
              {pendingFaculty.map(faculty => (
                <div key={faculty._id} className="faculty-approval-card">
                  <div className="faculty-details">
                    <div className="faculty-main-info">
                      <h4>{faculty.username}</h4>
                      <span className="faculty-email">{faculty.email}</span>
                    </div>
                    <div className="faculty-meta">
                      <div className="meta-item">
                        <strong>Department:</strong> {faculty.department}
                      </div>
                      <div className="meta-item">
                        <strong>Faculty ID:</strong> {faculty.facultyId || 'Not provided'}
                      </div>
                      <div className="meta-item">
                        <strong>Registered:</strong> {new Date(faculty.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button 
                      onClick={() => approveFaculty(faculty._id)}
                      className="btn btn-success approve-btn"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => rejectFaculty(faculty._id)}
                      className="btn btn-danger reject-btn"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="admin-guide">
            <h4>💡 Admin Guide</h4>
            <ul>
              <li>Review each faculty registration carefully</li>
              <li>Approve legitimate institutional email addresses</li>
              <li>Reject suspicious or incomplete applications</li>
              <li>Approved faculty can immediately login and create subjects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;