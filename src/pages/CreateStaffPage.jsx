import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';
import './CreateStaffPage.css';

export default function CreateStaffPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'staff' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.username.trim())            e.username = 'Username is required';
    if (form.password.length < 6)         e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post('/admin-panel/create-staff/', form);
      toast.success(`${form.role === 'admin' ? 'Admin' : 'Staff'} account created!`);
      navigate('/admin/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        Object.entries(data).forEach(([k, v]) => toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`));
      } else { toast.error('Failed to create user.'); }
    } finally { setLoading(false); }
  };

  return (
    <div className="staff-page">
      <div className="staff-bg-blob staff-bg-blob-1" />
      <div className="staff-bg-blob staff-bg-blob-2" />

      <div className="staff-container">
        <button className="staff-back" onClick={() => navigate('/admin/dashboard')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>

        <div className="staff-card">
          <div className="staff-card-top">
            <div className="staff-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.5"/>
                <path d="M3 21c0-4.4 2.7-8 6-8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M17 13v8M13 17h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1>Create New Account</h1>
              <p>Add a staff member or admin to the system</p>
            </div>
          </div>

          {/* Role selector */}
          <div className="staff-role-selector">
            {['staff', 'admin'].map(r => (
              <button key={r} type="button"
                className={`staff-role-btn ${form.role === r ? 'active' : ''}`}
                onClick={() => setForm(p => ({...p, role: r}))}>
                <div className={`staff-role-icon ${r}`}>
                  {r === 'staff' ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1l2 6h6l-5 3.6 2 6L9 13l-5 3.6 2-6L1 7h6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="staff-role-name">{r === 'staff' ? 'Staff' : 'Admin'}</div>
                  <div className="staff-role-desc">
                    {r === 'staff' ? 'View & edit status only' : 'Full access & management'}
                  </div>
                </div>
                {form.role === r && <div className="staff-role-check">✓</div>}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="staff-form">
            <div className="staff-field">
              <label>Username <span className="req">*</span></label>
              <div className={`staff-input-wrap ${errors.username ? 'error' : ''}`}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="staff-ico">
                  <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1.5 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input type="text" placeholder="e.g. john_staff"
                  value={form.username}
                  onChange={e => { setForm(p => ({...p, username: e.target.value})); setErrors(p => ({...p, username: ''})); }} />
              </div>
              {errors.username && <span className="staff-err">{errors.username}</span>}
            </div>

            <div className="staff-field">
              <label>Email <span className="staff-opt">(optional)</span></label>
              <div className="staff-input-wrap">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="staff-ico">
                  <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 4.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input type="email" placeholder="email@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))} />
              </div>
            </div>

            <div className="staff-field">
              <label>Password <span className="req">*</span></label>
              <div className={`staff-input-wrap ${errors.password ? 'error' : ''}`}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="staff-ico">
                  <rect x="2.5" y="7" width="10" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="7.5" cy="10" r="1" fill="currentColor"/>
                </svg>
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password: ''})); }} />
                <button type="button" className="staff-eye" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '👁️' : '🙈'}
                </button>
              </div>
              {errors.password && <span className="staff-err">{errors.password}</span>}
            </div>

            <div className="staff-form-actions">
              <button type="button" className="staff-btn-cancel" onClick={() => navigate('/admin/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="staff-btn-create" disabled={loading}>
                {loading ? <span className="staff-spinner" /> : (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                {loading ? 'Creating…' : `Create ${form.role === 'admin' ? 'Admin' : 'Staff'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}