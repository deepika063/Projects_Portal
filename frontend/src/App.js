import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import RegisterStudent from './pages/RegisterStudent';
import RegisterFaculty from './pages/RegisterFaculty';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard'; // Import the real one
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// Default Dashboard Component (for other roles)
const DefaultDashboard = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-content">
          <h1>Projects Portal</h1>
          <div className="nav-links">
            <span>Welcome, {user?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>Role: {user?.role}</p>
        <p>Department: {user?.department}</p>
        <p>This is your dashboard. We'll build specific features based on your role.</p>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  
  // Render different dashboards based on user role
  if (user?.role === 'student') {
    return <StudentDashboard />;
  } else if (user?.role === 'faculty') {
    return <FacultyDashboard />; // Use the imported FacultyDashboard
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <DefaultDashboard />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register/student" element={
              <PublicRoute>
                <RegisterStudent />
              </PublicRoute>
            } />
            <Route path="/register/faculty" element={
              <PublicRoute>
                <RegisterFaculty />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;