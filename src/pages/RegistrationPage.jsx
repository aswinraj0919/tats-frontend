import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../config/api';
import { HIERARCHY, DOMAINS } from '../config/constants';
import styles from './Registration.module.css';

const STEPS = ['Contact', 'Verify OTP', 'Your Details', 'Done'];

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [sessionToken, setSessionToken] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const { register, handleSubmit, watch, getValues, trigger, formState: { errors } } = useForm();
  const watchDomain = watch('domain');

  // ── Step 0: Send OTP ──────────────────────────────────────────────
  const handleSendOTP = async (data) => {
    setLoading(true);
    try {
      await API.post('/users/send-otp/', {
        email: data.email,
        mobile: data.mobile,
      });
      toast.success('OTP sent to your email and mobile!');
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: Verify OTP ────────────────────────────────────────────
  const handleVerifyOTP = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/users/verify-otp/', {
        email: data.email,
        mobile: data.mobile,
        email_otp: data.email_otp,
        mobile_otp: data.mobile_otp,
      });
      setSessionToken(res.data.session_token);
      toast.success('Both OTPs verified!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit registration ───────────────────────────────────
  const handleRegister = async (data) => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role.');
      return;
    }
    const cvFile = data.cv?.[0];
    if (!cvFile) {
      toast.error('Please upload your CV.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', getValues('email'));
      formData.append('mobile', getValues('mobile'));
      formData.append('domain', data.domain);
      formData.append('level', data.level);
      formData.append('session_token', sessionToken);
      formData.append('cv', cvFile);
      selectedRoles.forEach(role => formData.append('roles', role));
      // status is NOT sent — backend always sets "Not Placed"

      const res = await API.post('/users/register/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittedData({
        id: res.data.id,
        name: data.name,
        email: getValues('email'),
        mobile: getValues('mobile'),
        domain: data.domain,
        level: data.level,
        roles: selectedRoles,
        cvLink: res.data.cv_link,
      });
      setStep(3);
    } catch (err) {
      const errs = err.response?.data;
      if (errs && typeof errs === 'object') {
        Object.entries(errs).forEach(([k, v]) =>
          toast.error(`${k}: ${Array.isArray(v) ? v[0] : v}`)
        );
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) =>
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );

  const availableRoles = watchDomain ? DOMAINS[watchDomain] || [] : [];

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>MP</div>
          <div>
            <h1>Manpower Registration</h1>
            <p>Register your professional profile</p>
          </div>
        </div>

        {/* Step indicator — hide on success */}
        {step < 3 && (
          <div className={styles.stepIndicator}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${i < step ? styles.done : i === step ? styles.active : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={i === step ? styles.stepLabelActive : styles.stepLabel}>{s}</span>
                {i < 2 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 0: Contact ── */}
        {step === 0 && (
          <form onSubmit={handleSubmit(handleSendOTP)} className={styles.form}>
            <p className={styles.sectionNote}>We'll verify your contact details with OTP before registration.</p>

            <div className={styles.field}>
              <label>Email Address <span className={styles.req}>*</span></label>
              <input
                type="email"
                placeholder="yourname@email.com"
                className={errors.email ? styles.inputError : ''}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                })}
              />
              {errors.email && <span className={styles.errMsg}>{errors.email.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Mobile Number <span className={styles.req}>*</span></label>
              <input
                type="tel"
                placeholder="+919876543210"
                className={errors.mobile ? styles.inputError : ''}
                {...register('mobile', {
                  required: 'Mobile number is required',
                  pattern: { value: /^\+?[\d]{10,15}$/, message: 'Enter a valid mobile number (10–15 digits, optional +)' },
                })}
              />
              {errors.mobile && <span className={styles.errMsg}>{errors.mobile.message}</span>}
              <span className={styles.hint}>Include country code, e.g. +91 for India</span>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Sending OTP…' : 'Send OTP →'}
            </button>
          </form>
        )}

        {/* ── Step 1: Verify OTP ── */}
        {step === 1 && (
          <form onSubmit={handleSubmit(handleVerifyOTP)} className={styles.form}>
            <div className={styles.otpInfo}>
              <span className={styles.otpIcon}>📨</span>
              <div>
                <p>OTP sent to <strong>{getValues('email')}</strong></p>
                <p>and mobile <strong>{getValues('mobile')}</strong></p>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label>Email OTP <span className={styles.req}>*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  className={`${styles.otpInput} ${errors.email_otp ? styles.inputError : ''}`}
                  {...register('email_otp', {
                    required: 'Email OTP required',
                    pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
                  })}
                />
                {errors.email_otp && <span className={styles.errMsg}>{errors.email_otp.message}</span>}
              </div>
              <div className={styles.field}>
                <label>Mobile OTP <span className={styles.req}>*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  className={`${styles.otpInput} ${errors.mobile_otp ? styles.inputError : ''}`}
                  {...register('mobile_otp', {
                    required: 'Mobile OTP required',
                    pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
                  })}
                />
                {errors.mobile_otp && <span className={styles.errMsg}>{errors.mobile_otp.message}</span>}
              </div>
            </div>

            <div className={styles.btnRow}>
              <button type="button" className={styles.btnSecondary} onClick={() => setStep(0)}>← Back</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
            </div>

            <button
              type="button"
              className={styles.resendBtn}
              onClick={async () => {
                setLoading(true);
                try {
                  await API.post('/users/send-otp/', { email: getValues('email'), mobile: getValues('mobile') });
                  toast.success('OTP resent!');
                } catch (e) {
                  toast.error(e.response?.data?.error || 'Resend failed');
                } finally { setLoading(false); }
              }}
              disabled={loading}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* ── Step 2: Profile Details ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit(handleRegister)} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name <span className={styles.req}>*</span></label>
              <input
                type="text"
                placeholder="e.g. Aswin Kumar"
                className={errors.name ? styles.inputError : ''}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  pattern: { value: /^[a-zA-Z\s.'-]+$/, message: 'Name can only contain letters and spaces' },
                })}
              />
              {errors.name && <span className={styles.errMsg}>{errors.name.message}</span>}
            </div>

            <div className={styles.twoCol}>
              <div className={styles.field}>
                <label>Domain <span className={styles.req}>*</span></label>
                <select
                  className={errors.domain ? styles.inputError : ''}
                  {...register('domain', { required: 'Please select a domain' })}
                  onChange={(e) => {
                    setSelectedRoles([]);
                  }}
                >
                  <option value="">Select domain…</option>
                  {Object.keys(DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.domain && <span className={styles.errMsg}>{errors.domain.message}</span>}
              </div>
              <div className={styles.field}>
                <label>Level <span className={styles.req}>*</span></label>
                <select
                  className={errors.level ? styles.inputError : ''}
                  {...register('level', { required: 'Please select a level' })}
                >
                  <option value="">Select level…</option>
                  {HIERARCHY.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.level && <span className={styles.errMsg}>{errors.level.message}</span>}
              </div>
            </div>

            {/* Role multi-select */}
            <div className={styles.field}>
              <label>
                Roles <span className={styles.req}>*</span>
                <span className={styles.hint}> — select one or more</span>
              </label>
              {!watchDomain ? (
                <div className={styles.roleEmpty}>Select a domain above to see available roles</div>
              ) : (
                <div className={styles.roleGrid}>
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      className={`${styles.roleChip} ${selectedRoles.includes(role) ? styles.roleChipSelected : ''}`}
                      onClick={() => toggleRole(role)}
                    >
                      {selectedRoles.includes(role) && <span className={styles.chipCheck}>✓ </span>}
                      {role}
                    </button>
                  ))}
                </div>
              )}
              {selectedRoles.length > 0 && (
                <div className={styles.selectedRolesList}>
                  <strong>Selected:</strong> {selectedRoles.join(', ')}
                </div>
              )}
            </div>

            {/* CV Upload */}
            <div className={styles.field}>
              <label>Upload CV <span className={styles.req}>*</span></label>
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  id="cv-upload"
                  className={styles.fileInput}
                  {...register('cv', { required: 'Please upload your CV' })}
                />
                <label htmlFor="cv-upload" className={styles.uploadLabel}>
                  <span className={styles.uploadIcon}>📎</span>
                  <span>Click to upload CV</span>
                  <span className={styles.hint}>PDF or Word (.doc/.docx) — max 5 MB</span>
                </label>
              </div>
              {errors.cv && <span className={styles.errMsg}>{errors.cv.message}</span>}
              {watch('cv')?.[0] && (
                <div className={styles.fileSelected}>
                  ✓ {watch('cv')[0].name}
                </div>
              )}
            </div>

            <div className={styles.btnRow}>
              <button type="button" className={styles.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? <><span className={styles.spinner} /> Submitting…</> : 'Submit Registration →'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Success Page ── */}
        {step === 3 && submittedData && (
          <div className={styles.successPage}>
            <div className={styles.successCircle}>
              <svg viewBox="0 0 52 52" className={styles.checkSvg}>
                <circle cx="26" cy="26" r="25" fill="none" className={styles.checkCircle} />
                <path d="M14 27l8 8 16-16" fill="none" className={styles.checkMark} />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Registration Successful!</h2>
            <p className={styles.successSub}>
              Your profile has been saved. Our team will review and contact you shortly.
            </p>

            <div className={styles.summaryCard}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Reference ID</span>
                <span className={styles.summaryId}>{submittedData.id}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Name</span>
                <span>{submittedData.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Email</span>
                <span>{submittedData.email}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Mobile</span>
                <span>{submittedData.mobile}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Domain</span>
                <span>{submittedData.domain}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Level</span>
                <span>{submittedData.level}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Roles</span>
                <span>{submittedData.roles.join(', ')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>CV</span>
                <a href={submittedData.cvLink} target="_blank" rel="noreferrer" className={styles.cvLink}>
                  View uploaded CV ↗
                </a>
              </div>
            </div>

            <div className={styles.successActions}>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setStep(0);
                  setSelectedRoles([]);
                  setSessionToken('');
                  setSubmittedData(null);
                }}
              >
                Register Another Person
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}