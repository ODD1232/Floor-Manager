// frontend/src/views/recruitment/Round2Interview.jsx
import { useEffect, useState } from 'react';
import { getCandidates, updateRound22, dumpCandidates } from '../../services/recruitmentApi';
import '../../styles/recruitment.css';

const SKILL_LEVELS = ['', 'unskilled', 'skilled', 'highly_skilled'];
const DEPARTMENTS  = ['', 'HR', 'Production', 'Maintenance', 'Quality', 'Safety', 'Admin', 'Logistics', 'IT'];

export default function Round2Interview() {
  const [candidates, setCandidates]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selected, setSelected]           = useState(new Set());       // selected ids
  const [statuses, setStatuses]           = useState({});              // { id: 'passed'|'failed' }
  const [search, setSearch]               = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [filterSkill, setFilterSkill]     = useState('');
  const [toast, setToast]                 = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [dumpModal, setDumpModal]         = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ round: 2, status: 'IN_ROUND2' });
      setCandidates(data.filter(c => c.round2Type === 'interview'));
      setSelected(new Set());
      setStatuses({});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = candidates.filter(c => {
    if (filterDept  && c.department !== filterDept)   return false;
    if (filterSkill && c.skillLevel !== filterSkill)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.aadharNo.includes(search)) return false;
    }
    return true;
  });

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const setStatus = (id, status) => setStatuses(p => ({ ...p, [id]: status }));

  // ── Submit interview results ───────────────────────────────────────────────
  const handleSubmit = async () => {
    const updates = Array.from(selected)
      .filter(id => statuses[id])
      .map(id => ({ id, status: statuses[id] }));

    if (!updates.length) {
      showToast('error', 'Set pass/fail status for at least one selected candidate.');
      return;
    }

    setSubmitting(true);
    try {
      await updateRound22(updates);
      showToast('success', `${updates.length} candidate(s) updated.`);
      load();
    } catch {
      showToast('error', 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Dump selected ─────────────────────────────────────────────────────────
  const handleDump = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    setSubmitting(true);
    try {
      await dumpCandidates(ids, 'Rejected at Round 2.2 interview');
      showToast('success', `${ids.length} candidate(s) rejected.`);
      setDumpModal(false);
      load();
    } catch {
      showToast('error', 'Dump failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const passedList  = candidates.filter(c => c.round22Status === 'passed');
  const pendingList = filtered.filter(c => !c.round22Status || c.round22Status === 'pending');

  return (
    <div className="view-panel" style={{ maxWidth: 1000 }}>
      <div className="rec-header">
        <h2 className="rec-title">Round 2.2 — Interview Panel</h2>
        <p className="rec-sub">Review all new candidates. Set interview result per candidate, then move or dump.</p>
      </div>

      {toast && (
        <div className={`rec-toast rec-toast-${toast.type}`}>
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Filter bar */}
      <div className="rec-filter-bar">
        <div className="rec-search-wrap">
          <span className="rec-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input className="rec-search" placeholder="Name or Aadhar no…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="rec-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d || 'All Departments'}</option>)}
        </select>
        <select className="rec-filter-select" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
          {SKILL_LEVELS.map(s => <option key={s} value={s}>{s ? s.replace('_',' ') : 'All Skills'}</option>)}
        </select>
        <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>↻</button>
      </div>

      {/* Action bar */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selected.size} selected</span>
          <button className="rec-btn rec-btn-primary rec-btn-sm" onClick={handleSubmit} disabled={submitting}>
            → Move to Round 3
          </button>
          <button className="rec-btn rec-btn-danger rec-btn-sm" onClick={() => setDumpModal(true)} disabled={submitting}>
            🗑 Dump Selected
          </button>
        </div>
      )}

      {/* Pending list */}
      {loading ? (
        <div className="rec-empty"><div className="rec-empty-icon"><svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg></div><p>Loading…</p></div>
      ) : pendingList.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
          <p>No pending interview candidates.</p>
        </div>
      ) : (
        <div className="rec-table-wrap" style={{ marginBottom: 28 }}>
          <table className="rec-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="rec-checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
                <th>Candidate</th>
                <th>Phone</th>
                <th>Aadhar</th>
                <th>Dept</th>
                <th>Skill</th>
                <th>Contractor</th>
                <th>Interview</th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map(c => (
                <tr key={c.id} className={selected.has(c.id) ? 'selected' : ''}>
                  <td><input type="checkbox" className="rec-checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} /></td>
                  <td>
                    <div className="cand-profile" style={{ gap: 10 }}>
                      <div className="cand-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem', borderRadius: 8 }}>
                        {c.photoPath ? <img src={`http://localhost:5009/${c.photoPath}`} alt={c.name} /> : c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="cand-name" style={{ fontSize: '0.85rem' }}>{c.name}</div>
                        <div className="cand-meta">{c.qualification}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{c.aadharNo}</td>
                  <td>{c.department || '—'}</td>
                  <td>{c.skillLevel ? <span className="badge badge-r2">{c.skillLevel.replace('_',' ')}</span> : '—'}</td>
                  <td>{c.contractor?.name || '—'}</td>
                  <td>
                    <select
                      className="rec-filter-select"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      value={statuses[c.id] || ''}
                      onChange={e => { setStatus(c.id, e.target.value); if (!selected.has(c.id)) toggleSelect(c.id); }}
                    >
                      <option value="">— Select —</option>
                      <option value="passed">✓ Pass</option>
                      <option value="failed">✗ Fail</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Passed list (moved to Round 3 queue) */}
      {passedList.length > 0 && (
        <>
          <div className="rec-divider" />
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-accent)' }}>
              Final Round Candidates ({passedList.length})
            </span>
          </div>
          <div className="rec-table-wrap">
            <table className="rec-table">
              <thead>
                <tr><th>Candidate</th><th>Department</th><th>Skill</th><th>Contractor</th><th>Status</th></tr>
              </thead>
              <tbody>
                {passedList.map(c => (
                  <tr key={c.id}>
                    <td className="name-cell">{c.name}</td>
                    <td>{c.department || '—'}</td>
                    <td>{c.skillLevel ? <span className="badge badge-r2">{c.skillLevel.replace('_',' ')}</span> : '—'}</td>
                    <td>{c.contractor?.name || '—'}</td>
                    <td><span className="badge badge-passed">Passed Interview</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Dump confirmation modal */}
      {dumpModal && (
        <div className="rec-modal-overlay">
          <div className="rec-modal">
            <h3 className="rec-modal-title">Reject Candidates?</h3>
            <p className="rec-modal-sub">You are about to reject {selected.size} candidate(s). This cannot be undone.</p>
            <div className="rec-modal-actions">
              <button className="rec-btn rec-btn-ghost" onClick={() => setDumpModal(false)}>Cancel</button>
              <button className="rec-btn rec-btn-danger" onClick={handleDump} disabled={submitting}>
                {submitting ? 'Rejecting…' : `Yes, Reject ${selected.size}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}