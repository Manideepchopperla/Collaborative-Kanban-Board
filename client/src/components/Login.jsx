import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, Target } from 'lucide-react';
import { toast } from 'react-toastify';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
    <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <div className="logo-icon">
                <Target size={24} />
              </div>
              <span className="logo-text">CollabBoard</span>
            </div>
          </nav>
        </div>
      </header>
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-form-container">
        <div className="auth-form">
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={32} />
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your collaborative workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-content">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;