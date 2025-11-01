import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from'../assets/logos/logo.png';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();
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

    console.log('🔄 Attempting login with:', formData);

    const result = await login(formData);
    
    console.log('📝 Login result:', result);
    
    if (result.success) {
      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setMessage(result.message || 'Login failed. Please check your credentials.');
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

        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="register-links">
          <p>
            Don't have an account? 
            <Link to="/register/student"> Register as Student</Link> or 
            <Link to="/register/faculty"> Register as Faculty</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;