import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../config/api';
import { HIERARCHY, DOMAINS } from '../config/constants';
import './RegistrationPage.css';

const STEPS = ['Contact', 'Verify OTP', 'Your Profile', 'Success'];

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [sessionToken, setSessionToken] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm();
  const watchDomain = watch('domain');
  const watchCV = watch('cv');

  const handleSendOTP = async (data) => {
    setLoading(true);
    try {
      await API.post('/users/send-otp/', { email: data.email, mobile: data.mobile });
      toast.success('OTP sent to your email and mobile!');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/users/verify-otp/', {
        email: data.email, mobile: data.mobile,
        email_otp: data.email_otp, mobile_otp: data.mobile_otp,
      });
      setSessionToken(res.data.session_token);
      toast.success('Identity verified!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (data) => {
    if (selectedRoles.length === 0) { toast.error('Please select at least one role.'); return; }
    if (!data.cv?.[0]) { toast.error('Please upload your CV.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', getValues('email'));
      formData.append('mobile', getValues('mobile'));
      formData.append('domain', data.domain);
      formData.append('level', data.level);
      formData.append('session_token', sessionToken);
      formData.append('cv', data.cv[0]);
      selectedRoles.forEach(r => formData.append('roles', r));

      const res = await API.post('/users/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedData({
        id: res.data.id, name: data.name,
        email: getValues('email'), mobile: getValues('mobile'),
        domain: data.domain, level: data.level,
        roles: selectedRoles, cvLink: res.data.cv_link,
      });
      setStep(3);
    } catch (err) {
      const errs = err.response?.data;
      if (errs && typeof errs === 'object') {
        Object.entries(errs).forEach(([k, v]) =>
          toast.error(`${k !== 'error' ? k + ': ' : ''}${Array.isArray(v) ? v[0] : v}`)
        );
      } else { toast.error('Registration failed. Please try again.'); }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await API.post('/users/send-otp/', { email: getValues('email'), mobile: getValues('mobile') });
      toast.success('New OTP sent!');
    } catch (e) { toast.error(e.response?.data?.error || 'Resend failed'); }
    finally { setResending(false); }
  };

  const toggleRole = (role) =>
    setSelectedRoles(p => p.includes(role) ? p.filter(r => r !== role) : [...p, role]);

  const handleReset = () => {
    setStep(0); setSelectedRoles([]); setSessionToken(''); setSubmittedData(null);
  };

  const availableRoles = watchDomain ? DOMAINS[watchDomain] || [] : [];

  return (
    <div className="reg-page">
      {/* Background decoration */}
      <div className="reg-bg">
        <div className="reg-bg-circle reg-bg-circle-1" />
        <div className="reg-bg-circle reg-bg-circle-2" />
        <div className="reg-bg-grid" />
      </div>

      <div className="reg-container">
        {/* Brand header */}
        <div className="reg-brand">
          <div className="reg-brand-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="white" fillOpacity="0.15"/>
              <path d="M7 21V10l7-4 7 4v11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="11" y="15" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <circle cx="14" cy="10" r="2" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div className="reg-brand-name">TalentBridge</div>
            <div className="reg-brand-sub">Manpower Solutions</div>
          </div>
        </div>

        <div className="reg-card">
          {step < 3 && (
            <>
              <div className="reg-card-header">
                <h1 className="reg-title">Join Our Talent Network</h1>
                <p className="reg-subtitle">Complete your profile in 3 simple steps</p>
              </div>

              {/* Step bar */}
              <div className="reg-steps">
                {STEPS.slice(0, 3).map((s, i) => (
                  <div key={s} className={`reg-step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                    <div className="reg-step-num">
                      {i < step ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : i + 1}
                    </div>
                    <span className="reg-step-label">{s}</span>
                    {i < 2 && <div className="reg-step-connector" />}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── STEP 0 ── */}
          {step === 0 && (
            <form onSubmit={handleSubmit(handleSendOTP)} className="reg-form">
              <div className="reg-form-intro">
                <div className="reg-form-intro-icon">✉️</div>
                <p>We'll send a one-time password to verify your identity before registration.</p>
              </div>

              <div className="reg-field">
                <label>Email Address <span className="req">*</span></label>
                <div className={`reg-input-wrap ${errors.email ? 'error' : ''}`}>
                  <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input type="email" placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email address is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email' },
                    })} />
                </div>
                {errors.email && <span className="reg-err">{errors.email.message}</span>}
              </div>

              <div className="reg-field">
                <label>Mobile Number <span className="req">*</span></label>
                <div className={`reg-input-wrap ${errors.mobile ? 'error' : ''}`}>
                  <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="4" y="1" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="8" cy="12" r="0.8" fill="currentColor"/>
                  </svg>
                  <input type="tel" placeholder="+919876543210"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: { value: /^\+?[\d]{10,15}$/, message: 'Enter 10–15 digits, e.g. +919876543210' },
                    })} />
                </div>
                {errors.mobile && <span className="reg-err">{errors.mobile.message}</span>}
                <span className="reg-hint">Include country code (+91 for India)</span>
              </div>

              <button type="submit" className="reg-btn-primary" disabled={loading}>
                {loading ? <span className="reg-spinner" /> : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {loading ? 'Sending OTP…' : 'Send Verification OTP'}
              </button>
            </form>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleVerifyOTP)} className="reg-form">
              <div className="reg-otp-info">
                <div className="reg-otp-info-icon">🔐</div>
                <div>
                  <strong>Check your inbox & messages</strong>
                  <p>OTP sent to <em>{getValues('email')}</em> and <em>{getValues('mobile')}</em></p>
                </div>
              </div>

              <div className="reg-otp-row">
                <div className="reg-field">
                  <label>Email OTP <span className="req">*</span></label>
                  <input type="text" inputMode="numeric" maxLength={6}
                    placeholder="· · · · · ·"
                    className={`reg-otp-input ${errors.email_otp ? 'error' : ''}`}
                    {...register('email_otp', {
                      required: 'Required',
                      pattern: { value: /^\d{6}$/, message: '6 digits only' },
                    })} />
                  {errors.email_otp && <span className="reg-err">{errors.email_otp.message}</span>}
                </div>
                <div className="reg-field">
                  <label>Mobile OTP <span className="req">*</span></label>
                  <input type="text" inputMode="numeric" maxLength={6}
                    placeholder="· · · · · ·"
                    className={`reg-otp-input ${errors.mobile_otp ? 'error' : ''}`}
                    {...register('mobile_otp', {
                      required: 'Required',
                      pattern: { value: /^\d{6}$/, message: '6 digits only' },
                    })} />
                  {errors.mobile_otp && <span className="reg-err">{errors.mobile_otp.message}</span>}
                </div>
              </div>

              <div className="reg-btn-row">
                <button type="button" className="reg-btn-ghost" onClick={() => setStep(0)}>← Back</button>
                <button type="submit" className="reg-btn-primary" disabled={loading}>
                  {loading ? <span className="reg-spinner" /> : null}
                  {loading ? 'Verifying…' : 'Verify & Continue →'}
                </button>
              </div>
              <div className="reg-resend">
                Didn't receive it?{' '}
                <button type="button" className="reg-resend-btn" onClick={handleResend} disabled={resending}>
                  {resending ? 'Sending…' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit(handleRegister)} className="reg-form">
              <div className="reg-field">
                <label>Full Name <span className="req">*</span></label>
                <div className={`reg-input-wrap ${errors.name ? 'error' : ''}`}>
                  <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input type="text" placeholder="Your full name"
                    {...register('name', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })} />
                </div>
                {errors.name && <span className="reg-err">{errors.name.message}</span>}
              </div>

              <div className="reg-two-col">
                <div className="reg-field">
                  <label>Domain <span className="req">*</span></label>
                  <select className={errors.domain ? 'error' : ''}
                    {...register('domain', { required: 'Select a domain' })}
                    onChange={(e) => { setSelectedRoles([]); }}>
                    <option value="">Select domain…</option>
                    {Object.keys(DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.domain && <span className="reg-err">{errors.domain.message}</span>}
                </div>
                <div className="reg-field">
                  <label>Level <span className="req">*</span></label>
                  <select className={errors.level ? 'error' : ''}
                    {...register('level', { required: 'Select a level' })}>
                    <option value="">Select level…</option>
                    {HIERARCHY.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.level && <span className="reg-err">{errors.level.message}</span>}
                </div>
              </div>

              <div className="reg-field">
                <label>
                  Roles <span className="req">*</span>
                  <span className="reg-hint"> — tap to select multiple</span>
                </label>
                {!watchDomain ? (
                  <div className="reg-roles-placeholder">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#cbd5e1" strokeWidth="1.5"/>
                      <path d="M10 6v5M10 13v1" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Select a domain first to see available roles
                  </div>
                ) : (
                  <div className="reg-roles-grid">
                    {availableRoles.map(role => (
                      <button key={role} type="button"
                        className={`reg-role-chip ${selectedRoles.includes(role) ? 'selected' : ''}`}
                        onClick={() => toggleRole(role)}>
                        {selectedRoles.includes(role) && <span className="chip-check">✓</span>}
                        {role}
                      </button>
                    ))}
                  </div>
                )}
                {selectedRoles.length > 0 && (
                  <div className="reg-selected-roles">
                    <strong>{selectedRoles.length} selected:</strong> {selectedRoles.join(', ')}
                  </div>
                )}
              </div>

              <div className="reg-field">
                <label>Upload CV <span className="req">*</span> <span className="reg-hint">— PDF or Word, max 5 MB</span></label>
                <label className={`reg-upload-area ${watchCV?.[0] ? 'has-file' : ''}`}>
                  <input type="file" accept=".pdf,.doc,.docx" className="reg-file-hidden"
                    {...register('cv', { required: 'Please upload your CV' })} />
                  {watchCV?.[0] ? (
                    <div className="reg-upload-done">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M14 2v6h6M9 13l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{watchCV[0].name}</span>
                      <span className="reg-file-size">({(watchCV[0].size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="reg-upload-prompt">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 20V8M10 14l6-6 6 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 24h20" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Drop your CV here or <em>click to browse</em></span>
                      <span className="reg-hint">PDF, DOC, DOCX up to 5 MB</span>
                    </div>
                  )}
                </label>
                {errors.cv && <span className="reg-err">{errors.cv.message}</span>}
              </div>

              <div className="reg-btn-row">
                <button type="button" className="reg-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="reg-btn-primary" disabled={loading}>
                  {loading ? <><span className="reg-spinner" /> Submitting…</> : 'Submit Registration →'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3 SUCCESS ── */}
          {step === 3 && submittedData && (
            <div className="reg-success">
              <div className="reg-success-anim">
                <svg className="reg-check-svg" viewBox="0 0 80 80">
                  <circle className="reg-check-circle" cx="40" cy="40" r="36" />
                  <path className="reg-check-path" d="M24 40l12 12 20-20" />
                </svg>
              </div>
              <h2 className="reg-success-title">You're Registered!</h2>
              <p className="reg-success-msg">Your profile has been saved successfully. Our team will review your application and reach out soon.</p>

              <div className="reg-ref-badge">
                <span className="reg-ref-label">Reference ID</span>
                <span className="reg-ref-id">{submittedData.id}</span>
              </div>

              <div className="reg-summary">
                {[
                  { label: 'Name',   value: submittedData.name },
                  { label: 'Email',  value: submittedData.email },
                  { label: 'Mobile', value: submittedData.mobile },
                  { label: 'Domain', value: submittedData.domain },
                  { label: 'Level',  value: submittedData.level },
                  { label: 'Roles',  value: submittedData.roles.join(', ') },
                ].map(({ label, value }) => (
                  <div key={label} className="reg-summary-row">
                    <span className="reg-summary-label">{label}</span>
                    <span className="reg-summary-value">{value}</span>
                  </div>
                ))}
                <div className="reg-summary-row">
                  <span className="reg-summary-label">CV</span>
                  <a href={submittedData.cvLink} target="_blank" rel="noreferrer" className="reg-cv-link">
                    View uploaded CV ↗
                  </a>
                </div>
              </div>

              <button className="reg-btn-outline" onClick={handleReset}>
                Register Another Candidate
              </button>
            </div>
          )}
        </div>

        <p className="reg-footer">© 2025 TalentBridge Manpower Solutions. All rights reserved.</p>
      </div>
    </div>
  );
}