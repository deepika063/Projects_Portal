import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Import your logo - update the path to match your file
import logo from '../assets/logos/logo.png';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    academicYear: '2024-2025',
    enrolledSubjects: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { registerStudent } = useAuth();
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

    console.log('🔄 Registering student:', submitData);

    const result = await registerStudent(submitData);
    
    console.log('📝 Registration result:', result);
    
    if (result.success) {
      setMessage('Registration successful! You can now login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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

        <h2>Student Registration</h2>
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
              placeholder="Enter your email"
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
            <label>Academic Year:</label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2022-2023">2022-2023</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Student'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="register-links">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <p>
            Are you faculty? <Link to="/register/faculty">Register as Faculty</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;