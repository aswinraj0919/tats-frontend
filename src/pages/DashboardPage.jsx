import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../config/api';
import { HIERARCHY, DOMAINS } from '../config/constants';

export default function DashboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', domain: '', level: '', role: '', status: '' });
  const [exporting, setExporting] = useState(false);
  const [editingStatus, setEditingStatus] = useState({});

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  const isAdmin = role === 'admin';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await API.get(`/admin-panel/dashboard/?${params}`);
      setCandidates(res.data.candidates);
    } catch {
      toast.error('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.patch(`/admin-panel/status/${id}/`, { status: newStatus });
      toast.success('Status updated.');
      fetchData();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate permanently?')) return;
    try {
      await API.delete(`/admin-panel/delete/${id}/`);
      toast.success('Candidate deleted.');
      fetchData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleExportPDF = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one candidate to export.');
      return;
    }
    setExporting(true);
    try {
      const res = await API.post('/admin-panel/export-pdf/', { ids: selected }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = 'candidates.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported!');
    } catch {
      toast.error('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll = () => setSelected(candidates.map(c => c.ID));
  const clearSelect = () => setSelected([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a56db', color: 'white', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Manpower Dashboard</span>
          <span style={{ marginLeft: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 12, fontSize: 12 }}>
            {role?.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>{username}</span>
          {isAdmin && (
            <button onClick={() => navigate('/admin/create-staff')}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              + Create Staff
            </button>
          )}
          <button onClick={handleLogout}
            style={{ background: 'white', color: '#1a56db', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {[
            { key: 'keyword', placeholder: 'Search anything...' },
          ].map(({ key, placeholder }) => (
            <input key={key} placeholder={placeholder}
              value={filters[key]}
              onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
              style={{ flex: 2, minWidth: 180, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
          ))}
          <select value={filters.domain} onChange={e => setFilters(p => ({ ...p, domain: e.target.value }))}
            style={filterSelect}>
            <option value="">All Domains</option>
            {Object.keys(DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filters.level} onChange={e => setFilters(p => ({ ...p, level: e.target.value }))}
            style={filterSelect}>
            <option value="">All Levels</option>
            {HIERARCHY.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            style={filterSelect}>
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Not Placed">Not Placed</option>
          </select>
          <button onClick={fetchData} style={{ ...actionBtn, background: '#1a56db' }}>Search</button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#6b7280' }}>{candidates.length} candidates</span>
          <button onClick={selectAll} style={ghostBtn}>Select All</button>
          <button onClick={clearSelect} style={ghostBtn}>Clear</button>
          <button onClick={handleExportPDF} disabled={exporting || selected.length === 0}
            style={{ ...actionBtn, background: '#16a34a', opacity: selected.length === 0 ? 0.5 : 1 }}>
            {exporting ? 'Exporting...' : `Export PDF (${selected.length})`}
          </button>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', overflow: 'auto' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading candidates...</div>
          ) : candidates.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No candidates found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={th}><input type="checkbox" onChange={e => e.target.checked ? selectAll() : clearSelect()} /></th>
                  <th style={th}>ID</th>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Mobile</th>
                  <th style={th}>Domain</th>
                  <th style={th}>Level</th>
                  <th style={th}>Roles</th>
                  <th style={th}>Status</th>
                  <th style={th}>CV</th>
                  {isAdmin && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr key={c.ID || i} style={{ borderBottom: '1px solid #f1f5f9', background: selected.includes(c.ID) ? '#f0f4ff' : 'white' }}>
                    <td style={td}><input type="checkbox" checked={selected.includes(c.ID)} onChange={() => toggleSelect(c.ID)} /></td>
                    <td style={{ ...td, fontWeight: 600, color: '#1a56db' }}>{c.ID}</td>
                    <td style={td}>{c.Name}</td>
                    <td style={td}>{c.Email}</td>
                    <td style={td}>{c.Mobile}</td>
                    <td style={td}><span style={domainBadge}>{c.Domain}</span></td>
                    <td style={{ ...td, maxWidth: 160, whiteSpace: 'normal', fontSize: 11 }}>{c.Level}</td>
                    <td style={{ ...td, maxWidth: 160, whiteSpace: 'normal', fontSize: 11 }}>{c.Roles}</td>
                    <td style={td}>
                      <select
                        value={c.Status || 'Not Placed'}
                        onChange={e => handleStatusChange(c.ID, e.target.value)}
                        style={{ ...statusSelect, background: c.Status === 'Placed' ? '#dcfce7' : '#fef9c3', color: c.Status === 'Placed' ? '#16a34a' : '#854d0e' }}>
                        <option value="Not Placed">Not Placed</option>
                        <option value="Placed">Placed</option>
                      </select>
                    </td>
                    <td style={td}>
                      {c['CV Link'] && (
                        <a href={c['CV Link']} target="_blank" rel="noreferrer"
                          style={{ color: '#1a56db', textDecoration: 'underline', fontSize: 12 }}>
                          View CV
                        </a>
                      )}
                    </td>
                    {isAdmin && (
                      <td style={td}>
                        <button onClick={() => handleDelete(c.ID)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const th = { padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12, whiteSpace: 'nowrap' };
const td = { padding: '12px 14px', color: '#374151' };
const filterSelect = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: 'white' };
const actionBtn = { padding: '8px 16px', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const ghostBtn = { padding: '6px 12px', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 12 };
const domainBadge = { background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 };
const statusSelect = { border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' };