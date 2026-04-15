// frontend/src/views/recruitment/Round2Test.jsx  (FULL REPLACEMENT)
import { useEffect, useState } from 'react';
import { getCandidates, updateRound21, classifyCandidate, getContractors } from '../../services/recruitmentApi';
import '../../styles/recruitment.css';

const SKILL_LEVELS = ['unskilled', 'skilled', 'highly_skilled'];
const DEPARTMENTS  = ['HR', 'Production', 'Maintenance', 'Quality', 'Safety', 'Admin', 'Logistics', 'IT'];

const StatusBadge = ({ status }) => {
  const map = { pending: 'badge-pending', passed: 'badge-passed', failed: 'badge-failed' };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status || 'pending'}</span>;
};

// ── Inline classify modal ──────────────────────────────────────────────────────
function ClassifyModal({ candidate, onClose, onDone }) {
  const [skill, setSkill]   = useState(candidate.skillLevel || '');
  const [dept, setDept]     = useState(candidate.department || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!skill || !dept) return;
    setSaving(true);
    try {
      await classifyCandidate(candidate.id, skill, dept);
      onDone();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="rec-modal-overlay">
      <div className="rec-modal">
        <h3 className="rec-modal-title">Classify Candidate</h3>
        <p className="rec-modal-sub">{candidate.name} is missing skill level or department. Fill them to allow promotion.</p>
        <div className="rec-grid-2" style={{ gap: 12, marginBottom: 0 }}>
          <div className="rec-field">
            <label className="rec-label">Skill Level</label>
            <select className="rec-select" value={skill} onChange={e => setSkill(e.target.value)}>
              <option value="">Select…</option>
              {SKILL_LEVELS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="rec-field">
            <label className="rec-label">Department</label>
            <select className="rec-select" value={dept} onChange={e => setDept(e.target.value)}>
              <option value="">Select…</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="rec-modal-actions">
          <button className="rec-btn rec-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="rec-btn rec-btn-primary" onClick={handleSave} disabled={saving || !skill || !dept}>
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Round2Test() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(null);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');
  const [filterClassified, setFilterClassified] = useState('all'); // all | yes | no
  const [classifyTarget, setClassifyTarget]     = useState(null);  // candidate to classify

  const load = async () => {
    setLoading(true);
    try {
      // Fetch all IN_ROUND2 candidates with round2Type=test
      const { data } = await getCandidates({ status: 'IN_ROUND2' });
      setCandidates(data.filter(c => c.round2Type === 'test'));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleStatus = async (candidate, status) => {
    if (status === 'passed' && !candidate.isClassified) {
      setClassifyTarget(candidate);
      return;
    }
    setUpdating(candidate.id);
    try {
      await updateRound21(candidate.id, status);
      showToast('success', `${candidate.name} marked as ${status}.`);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = candidates.filter(c => {
    if (filterClassified === 'yes' && !c.isClassified) return false;
    if (filterClassified === 'no'  &&  c.isClassified) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.aadharNo.includes(search)) return false;
    }
    return true;
  });

  const unclassifiedCount = candidates.filter(c => !c.isClassified).length;

  return (
    <div className="view-panel" style={{ maxWidth: 960 }}>
      <div className="rec-header">
        <h2 className="rec-title">Round 2.1 — Skill / Written Test</h2>
        <p className="rec-sub">Mark test results. Unclassified candidates must be classified before passing to Round 3.</p>
      </div>

      {/* Unclassified warning banner */}
      {unclassifiedCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24',
          fontSize: '0.875rem',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <strong>{unclassifiedCount} unclassified candidate{unclassifiedCount > 1 ? 's' : ''}</strong> — they can fail but cannot pass until classified.
          <button className="rec-btn rec-btn-ghost rec-btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setFilterClassified('no')}>
            Show unclassified
          </button>
        </div>
      )}

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
        <select className="rec-filter-select" value={filterClassified} onChange={e => setFilterClassified(e.target.value)}>
          <option value="all">All Candidates</option>
          <option value="yes">Classified only</option>
          <option value="no">⚠ Unclassified only</option>
        </select>
        <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className="rec-empty"><div className="rec-empty-icon"><svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg></div><p>Loading…</p></div>
      ) : filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <p>No candidates in Round 2.1 test queue.</p>
        </div>
      ) : (
        <div className="rec-table-wrap">
          <table className="rec-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Phone</th>
                <th>Aadhar No.</th>
                <th>Department</th>
                <th>Skill Level</th>
                <th>Status</th>
                <th>Test Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="cand-profile" style={{ gap: 10 }}>
                      <div className="cand-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', borderRadius: 9 }}>
                        {c.photoPath
                          ? <img src={`http://localhost:5009/${c.photoPath}`} alt={c.name} />
                          : c.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="cand-name" style={{ fontSize: '0.875rem' }}>{c.name}</span>
                          {!c.isClassified && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 4, padding: '1px 5px' }}>
                              unclassified
                            </span>
                          )}
                        </div>
                        <div className="cand-meta">{c.qualification}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.aadharNo}</td>
                  <td>{c.department || <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not set</span>}</td>
                  <td>
                    {c.skillLevel
                      ? <span className="badge badge-r2">{c.skillLevel.replace('_', ' ')}</span>
                      : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not set</span>
                    }
                  </td>
                  <td><StatusBadge status={c.round21Status} /></td>
                  <td>
                    {!c.round21Status || c.round21Status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="rec-btn rec-btn-success rec-btn-sm"
                          disabled={updating === c.id}
                          onClick={() => handleStatus(c, 'passed')}
                          title={!c.isClassified ? 'Will prompt classification first' : ''}
                        >
                          {!c.isClassified ? '⚠ Pass' : '✓ Pass'}
                        </button>
                        <button
                          className="rec-btn rec-btn-danger rec-btn-sm"
                          disabled={updating === c.id}
                          onClick={() => handleStatus(c, 'failed')}
                        >✗ Fail</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Updated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Classify modal */}
      {classifyTarget && (
        <ClassifyModal
          candidate={classifyTarget}
          onClose={() => setClassifyTarget(null)}
          onDone={() => { setClassifyTarget(null); load(); showToast('success', 'Classified! Now you can pass the candidate.'); }}
        />
      )}
    </div>
  );
}