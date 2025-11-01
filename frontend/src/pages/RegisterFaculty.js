import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Import your logo - update the path to match your file
import logo from '../assets/logos/logo.png';

const RegisterFaculty = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    facultyId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { registerFaculty } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...submitData } = formData;

    console.log('🔄 Registering faculty:', submitData);

    const result = await registerFaculty(submitData);
    
    console.log('📝 Registration result:', result);
    
    if (result.success) {
      setMessage('Registration submitted! Your account is pending admin approval. You will receive an email when approved.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setMessage(result.message || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        {/* Logo Section */}
        <div className="logo-container">
          <img src={logo} alt="Projects Portal Logo" className="logo" />
          <div className="logo-text">Projects Portal</div>
        </div>

        <h2>Faculty Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your institutional email"
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label>Department:</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>
          </div>

          <div className="form-group">
            <label>Faculty ID (Optional):</label>
            <input
              type="text"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              placeholder="Enter your faculty ID"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Register as Faculty'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('submitted') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="register-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <p>
            Are you a student? <Link to="/register/student">Register as Student</Link>
          </p>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderRadius: '5px', fontSize: '14px', border: '1px solid #ffeaa7' }}>
          <strong>Note:</strong> Faculty accounts require admin approval before you can login. You'll be notified when your account is approved.
        </div>
      </div>
    </div>
  );
};

export default RegisterFaculty;