import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';
import { DOMAIN_COLORS } from '../config/constants';
import './CandidateDetailPage.css';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const candidate = state?.candidate;

  const [status, setStatus] = useState(candidate?.Status || 'Not Placed');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin';

  if (!candidate) {
    return (
      <div className="detail-not-found">
        <h2>Candidate not found</h2>
        <p>Navigate from the dashboard to view candidate details.</p>
        <button onClick={() => navigate('/admin/dashboard')}>← Back to Dashboard</button>
      </div>
    );
  }

  const dc = DOMAIN_COLORS[candidate.Domain] || { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
  const roles = candidate.Roles?.split(',').map(r => r.trim()).filter(Boolean) || [];

  const handleStatusSave = async () => {
    setSaving(true);
    try {
      await API.patch(`/admin-panel/status/${candidate.ID}/`, { status });
      toast.success('Status updated successfully.');
    } catch { toast.error('Failed to update status.'); }
    finally { setSaving(false); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await API.post('/admin-panel/export-pdf/', { ids: [candidate.ID] }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${candidate.Name?.replace(/\s+/g, '_')}_profile.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('PDF exported!');
    } catch { toast.error('Export failed.'); }
    finally { setExporting(false); }
  };

  const infoRows = [
    { label: 'Reference ID', value: candidate.ID,     mono: true },
    { label: 'Email',        value: candidate.Email },
    { label: 'Mobile',       value: candidate.Mobile },
    { label: 'Domain',       value: candidate.Domain },
    { label: 'Level',        value: candidate.Level },
    { label: 'Submitted',    value: candidate['Submitted At'] || '—' },
  ];

  return (
    <div className="detail-page">
      {/* Sidebar accent */}
      <div className="detail-accent" style={{ background: `linear-gradient(180deg, ${dc.dot}40, transparent)` }} />

      <div className="detail-container">
        {/* Back nav */}
        <button className="detail-back" onClick={() => navigate('/admin/dashboard')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Dashboard
        </button>

        {/* Header card */}
        <div className="detail-header-card">
          <div className="detail-avatar-wrap">
            <div className="detail-avatar" style={{ background: `${dc.dot}25`, color: dc.dot }}>
              {candidate.Name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="detail-avatar-ring" style={{ borderColor: `${dc.dot}40` }} />
          </div>

          <div className="detail-header-info">
            <div className="detail-header-top">
              <div>
                <h1 className="detail-name">{candidate.Name}</h1>
                <div className="detail-id">ID #{candidate.ID}</div>
              </div>
              <div className="detail-header-badges">
                <span className="detail-domain-badge"
                  style={{ background: dc.bg, color: dc.text }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dc.dot, display: 'inline-block', marginRight: 5 }} />
                  {candidate.Domain}
                </span>
                <span className={`detail-status-badge ${status === 'Placed' ? 'placed' : 'not-placed'}`}>
                  {status === 'Placed' ? '✓ Placed' : '○ Not Placed'}
                </span>
              </div>
            </div>

            <div className="detail-contact-row">
              <span className="detail-contact-item">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1 4l5.5 3.5L12 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {candidate.Email}
              </span>
              <span className="detail-contact-item">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="3.5" y="1" width="6" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="6.5" cy="9.5" r="0.7" fill="currentColor"/>
                </svg>
                {candidate.Mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="detail-grid">
          {/* Left column */}
          <div className="detail-col-left">
            {/* Info card */}
            <div className="detail-card">
              <div className="detail-card-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Profile Information
              </div>
              <div className="detail-info-list">
                {infoRows.map(({ label, value, mono }) => (
                  <div key={label} className="detail-info-row">
                    <span className="detail-info-label">{label}</span>
                    <span className={`detail-info-value ${mono ? 'mono' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level card */}
            <div className="detail-card">
              <div className="detail-card-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12h2V6H2v6zM7 12h2V2H7v10zM12 12h2V9h-2v3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                Position Level
              </div>
              <div className="detail-level-display">
                <div className="detail-level-bar">
                  <div className="detail-level-fill" style={{ background: dc.dot }} />
                </div>
                <p className="detail-level-text">{candidate.Level}</p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="detail-col-right">
            {/* Roles card */}
            <div className="detail-card">
              <div className="detail-card-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Roles & Specializations
                <span className="detail-count-badge">{roles.length}</span>
              </div>
              <div className="detail-roles-wrap">
                {roles.map((r, i) => (
                  <span key={i} className="detail-role-chip" style={{ borderColor: `${dc.dot}40`, color: dc.dot, background: `${dc.dot}10` }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* CV card */}
            <div className="detail-card">
              <div className="detail-card-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6l-4-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M10 1v5h5M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Curriculum Vitae
              </div>
              {candidate['CV Link'] ? (
                <div className="detail-cv-area">
                  <div className="detail-cv-icon">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M16 3H7a2 2 0 00-2 2v18a2 2 0 002 2h14a2 2 0 002-2V10l-7-7z" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M16 3v7h7" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M10 17h8M10 21h5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="detail-cv-info">
                    <span className="detail-cv-name">{candidate.Name}'s CV</span>
                    <span className="detail-cv-hint">Click to view or download</span>
                  </div>
                  <a href={candidate['CV Link']} target="_blank" rel="noreferrer" className="detail-cv-btn">
                    Open CV ↗
                  </a>
                </div>
              ) : (
                <p className="detail-no-cv">No CV uploaded</p>
              )}
            </div>

            {/* Status card */}
            <div className="detail-card">
              <div className="detail-card-header">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Placement Status
              </div>
              <div className="detail-status-area">
                <div className="detail-status-options">
                  {['Not Placed', 'Placed'].map(s => (
                    <button key={s}
                      className={`detail-status-opt ${status === s ? 'active' : ''} ${s === 'Placed' ? 'green' : 'amber'}`}
                      onClick={() => setStatus(s)}>
                      <span className="detail-status-radio" />
                      {s}
                    </button>
                  ))}
                </div>
                <button className="detail-save-btn" onClick={handleStatusSave} disabled={saving}>
                  {saving ? <span className="detail-spinner" /> : null}
                  {saving ? 'Saving…' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-actions">
          <button className="detail-export-btn" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? <span className="detail-spinner" /> : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1v8M3.5 5.5l4 4 4-4M1 12.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {exporting ? 'Generating PDF…' : 'Export as PDF'}
          </button>

          {isAdmin && (
            <button className="detail-delete-btn" onClick={async () => {
              if (!window.confirm(`Delete ${candidate.Name} permanently?`)) return;
              try {
                await API.delete(`/admin-panel/delete/${candidate.ID}/`);
                toast.success('Candidate deleted.');
                navigate('/admin/dashboard');
              } catch { toast.error('Delete failed.'); }
            }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1.5 3.5h12M5 3.5V2h5v1.5M6 6v5M9 6v5M2.5 3.5l.5 9h9l.5-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Candidate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
