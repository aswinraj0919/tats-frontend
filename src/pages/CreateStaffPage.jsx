import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';

export default function CreateStaffPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'staff' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post('/admin-panel/create-staff/', form);
      toast.success('User created successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        Object.values(data).forEach(v => toast.error(Array.isArray(v) ? v[0] : String(v)));
      } else {
        toast.error('Failed to create user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', maxWidth: 420, overflow: 'hidden' }}>
        <div style={{ background: '#1a56db', color: 'white', padding: '24px 28px' }}>
          <h2 style={{ margin: 0 }}>Create Staff / Admin</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'username', label: 'Username', type: 'text' },
            { key: 'email', label: 'Email (optional)', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
          ].map(({ key, label, type }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
              <input type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                style={{ padding: '10px 12px', border: `1.5px solid ${errors[key] ? '#ef4444' : '#e2e8f0'}`, borderRadius: 8, fontSize: 14 }} />
              {errors[key] && <span style={{ fontSize: 12, color: '#ef4444' }}>{errors[key]}</span>}
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: 'white' }}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => navigate('/admin/dashboard')}
              style={{ flex: 1, padding: '11px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ flex: 2, padding: '11px', background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}