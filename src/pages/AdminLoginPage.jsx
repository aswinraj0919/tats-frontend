import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password) e.password = 'Password is required';
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
      toast.success(`Welcome, ${res.data.username}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={outer}>
      <div style={card}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Admin Portal</h2>
          <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 13 }}>Manpower Management System</p>
        </div>
        <form onSubmit={handleLogin} style={formStyle}>
          <div style={field}>
            <label style={label}>Username</label>
            <input style={input(errors.username)} value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="Enter username" />
            {errors.username && <span style={err}>{errors.username}</span>}
          </div>
          <div style={field}>
            <label style={label}>Password</label>
            <input type="password" style={input(errors.password)} value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Enter password" />
            {errors.password && <span style={err}>{errors.password}</span>}
          </div>
          <button type="submit" style={btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const outer = { minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const card = { background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', maxWidth: 400, overflow: 'hidden' };
const headerStyle = { background: '#1a56db', color: 'white', padding: '28px 32px' };
const formStyle = { padding: 32, display: 'flex', flexDirection: 'column', gap: 18 };
const field = { display: 'flex', flexDirection: 'column', gap: 5 };
const label = { fontSize: 13, fontWeight: 600, color: '#374151' };
const input = (hasErr) => ({
  padding: '10px 14px', border: `1.5px solid ${hasErr ? '#ef4444' : '#e2e8f0'}`,
  borderRadius: 8, fontSize: 14, outline: 'none',
});
const err = { fontSize: 12, color: '#ef4444' };
const btn = {
  background: '#1a56db', color: 'white', padding: '12px', border: 'none',
  borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};