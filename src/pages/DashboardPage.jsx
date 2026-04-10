import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';
import { HIERARCHY, DOMAINS, DOMAIN_COLORS } from '../config/constants';
import './DashboardPage.css';

export default function DashboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', domain: '', level: '', role: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState({});

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  const fetchData = useCallback(async (f = appliedFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await API.get(`/admin-panel/dashboard/?${params}`);
      setCandidates(res.data.candidates || []);
    } catch { toast.error('Failed to load candidates.'); }
    finally { setLoading(false); }
  }, [appliedFilters]);

  useEffect(() => { fetchData(); }, []);

  const applyFilters = () => { setAppliedFilters({...filters}); fetchData(filters); };

  const clearFilters = () => {
    const blank = { keyword: '', domain: '', level: '', role: '', status: '' };
    setFilters(blank); setAppliedFilters(blank); fetchData(blank);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/admin-panel/status/${id}/`, { status: newStatus });
      toast.success('Status updated.');
      fetchData(appliedFilters);
    } catch { toast.error('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this candidate?')) return;
    try {
      await API.delete(`/admin-panel/delete/${id}/`);
      toast.success('Candidate deleted.');
      setSelected(p => p.filter(x => x !== id));
      fetchData(appliedFilters);
    } catch { toast.error('Delete failed.'); }
  };

  const handleExportPDF = async () => {
    if (selected.length === 0) { toast.error('Select at least one candidate.'); return; }
    setExporting(true);
    try {
      const res = await API.post('/admin-panel/export-pdf/', { ids: selected }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `candidates_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Exported ${selected.length} candidate(s) as PDF.`);
    } catch { toast.error('Export failed.'); }
    finally { setExporting(false); }
  };

  const toggleSelect = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const isAllSelected = candidates.length > 0 && selected.length === candidates.length;
  const toggleAll = () => setSelected(isAllSelected ? [] : candidates.map(c => c.ID));

  const handleLogout = () => { localStorage.clear(); navigate('/admin/login'); };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  return (
    <div className="dash-page">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M7 21V10l7-4 7 4v11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="11" y="15" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
              <circle cx="14" cy="10" r="2" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div className="dash-sidebar-brand-name">TalentBridge</div>
            <div className="dash-sidebar-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="dash-nav-item active">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Dashboard
          </div>
          {isAdmin && (
            <button className="dash-nav-item" onClick={() => navigate('/admin/create-staff')}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M1 16c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M13 11v6M10 14h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Manage Staff
            </button>
          )}
        </nav>

        <div className="dash-sidebar-user">
          <div className="dash-user-avatar">
            {username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="dash-user-info">
            <span className="dash-user-name">{username}</span>
            <span className={`dash-user-role ${role}`}>{role?.toUpperCase()}</span>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {/* Top bar */}
        <div className="dash-topbar">
          <div>
            <h1 className="dash-page-title">Candidates</h1>
            <p className="dash-page-sub">
              {loading ? 'Loading…' : `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <div className="dash-topbar-actions">
            {selected.length > 0 && (
              <button className="dash-btn-export" onClick={handleExportPDF} disabled={exporting}>
                {exporting ? <span className="dash-spinner" /> : (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1v9M3.5 6l4 4 4-4M1 12h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {exporting ? 'Exporting…' : `Export PDF (${selected.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="dash-filters">
          <div className="dash-filters-row">
            <div className="dash-search-wrap">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="dash-search-icon">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                className="dash-search"
                placeholder="Search by name, email, mobile, role…"
                value={filters.keyword}
                onChange={e => setFilters(p => ({...p, keyword: e.target.value}))}
                onKeyDown={e => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <select className="dash-filter-select" value={filters.domain}
              onChange={e => setFilters(p => ({...p, domain: e.target.value}))}>
              <option value="">All Domains</option>
              {Object.keys(DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="dash-filter-select" value={filters.status}
              onChange={e => setFilters(p => ({...p, status: e.target.value}))}>
              <option value="">All Status</option>
              <option value="Placed">Placed</option>
              <option value="Not Placed">Not Placed</option>
            </select>
            <button className="dash-btn-search" onClick={applyFilters}>Search</button>
            {activeFilterCount > 0 && (
              <button className="dash-btn-clear" onClick={clearFilters}>Clear</button>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="dash-stats">
          {[
            { label: 'Total', value: candidates.length, color: '#6366f1' },
            { label: 'Placed', value: candidates.filter(c => c.Status === 'Placed').length, color: '#10b981' },
            { label: 'Not Placed', value: candidates.filter(c => c.Status !== 'Placed').length, color: '#f59e0b' },
            { label: 'Selected', value: selected.length, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="dash-stat-card">
              <span className="dash-stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="dash-table-wrap">
          {loading ? (
            <div className="dash-loading">
              <div className="dash-loading-spinner" />
              <p>Loading candidates…</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="dash-empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="#334155" strokeWidth="2"/>
                <path d="M16 28s2-4 8-4 8 4 8 4M18 20h.02M30 20h.02" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>No candidates found</p>
              {activeFilterCount > 0 && <button className="dash-btn-clear" onClick={clearFilters}>Clear filters</button>}
            </div>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" className="dash-checkbox"
                      checked={isAllSelected} onChange={toggleAll} />
                  </th>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Domain</th>
                  <th>Level</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>CV</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => {
                  const dc = DOMAIN_COLORS[c.Domain] || { bg:'#f1f5f9', text:'#475569', dot:'#94a3b8' };
                  const isSelected = selected.includes(c.ID);
                  return (
                    <tr key={c.ID || i} className={isSelected ? 'selected' : ''}>
                      <td>
                        <input type="checkbox" className="dash-checkbox"
                          checked={isSelected} onChange={() => toggleSelect(c.ID)} />
                      </td>
                      <td>
                        <div className="dash-candidate-cell">
                          <div className="dash-avatar"
                            style={{ background: `${dc.dot}22`, color: dc.dot }}>
                            {c.Name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="dash-candidate-name">{c.Name}</div>
                            <div className="dash-candidate-id">#{c.ID}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dash-contact-cell">
                          <span>{c.Email}</span>
                          <span className="dash-mobile">{c.Mobile}</span>
                        </div>
                      </td>
                      <td>
                        <span className="dash-domain-badge"
                          style={{ background: dc.bg, color: dc.text }}>
                          <span className="dash-domain-dot" style={{ background: dc.dot }} />
                          {c.Domain}
                        </span>
                      </td>
                      <td>
                        <span className="dash-level-text">{c.Level}</span>
                      </td>
                      <td>
                        <div className="dash-roles-cell">
                          {c.Roles?.split(',').slice(0, 2).map((r, ri) => (
                            <span key={ri} className="dash-role-tag">{r.trim()}</span>
                          ))}
                          {c.Roles?.split(',').length > 2 && (
                            <span className="dash-role-more">+{c.Roles.split(',').length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          className={`dash-status-select ${c.Status === 'Placed' ? 'placed' : 'not-placed'}`}
                          value={c.Status || 'Not Placed'}
                          onChange={e => handleStatusChange(c.ID, e.target.value)}>
                          <option value="Not Placed">Not Placed</option>
                          <option value="Placed">Placed ✓</option>
                        </select>
                      </td>
                      <td>
                        {c['CV Link'] && (
                          <a href={c['CV Link']} target="_blank" rel="noreferrer" className="dash-cv-btn">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path d="M6.5 1v7M3 4.5l3.5 3.5L10 4.5M1 10.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            CV
                          </a>
                        )}
                      </td>
                      <td>
                        <div className="dash-action-btns">
                          <button className="dash-view-btn"
                            onClick={() => navigate(`/admin/candidate/${c.ID}`, { state: { candidate: c } })}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3"/>
                              <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
                            </svg>
                            View
                          </button>
                          {isAdmin && (
                            <button className="dash-del-btn" onClick={() => handleDelete(c.ID)}>
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M1.5 3h10M4.5 3V1.5h4V3M5.5 5.5v4M7.5 5.5v4M2.5 3l.5 8h7l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}