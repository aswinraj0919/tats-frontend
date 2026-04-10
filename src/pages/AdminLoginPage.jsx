import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password)        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await API.post('/admin-panel/login/', form);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-blob login-bg-blob-1" />
        <div className="login-bg-blob login-bg-blob-2" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-container">
        <div className="login-brand">
          <div className="login-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M7 21V10l7-4 7 4v11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="11" y="15" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <circle cx="14" cy="10" r="2" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="login-brand-name">TalentBridge</span>
        </div>

        <div className="login-card">
          <div className="login-card-top">
            <h1>Admin Portal</h1>
            <p>Sign in to manage candidates and staff</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Username</label>
              <div className={`login-input-wrap ${errors.username ? 'error' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="login-ico">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text" placeholder="Enter your username"
                  value={form.username}
                  onChange={e => { setForm(p => ({...p, username: e.target.value})); setErrors(p => ({...p, username:''})); }}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="login-err">{errors.username}</span>}
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className={`login-input-wrap ${errors.password ? 'error' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="login-ico">
                  <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password:''})); }}
                  autoComplete="current-password"
                />
                <button type="button" className="login-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8s2.5-5 6-5 6 5 6 5-2.5 5-6 5-6-5-6-5z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="login-err">{errors.password}</span>}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="login-card-footer">
            <a href="/" className="login-back-link">← Back to Registration</a>
          </div>
        </div>

        <p className="login-footer">© 2025 TalentBridge. Secure admin access.</p>
      </div>
    </div>
  );
}