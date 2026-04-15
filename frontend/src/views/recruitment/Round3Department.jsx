// frontend/src/views/recruitment/Round3Department.jsx
import { useEffect, useRef, useState } from 'react';
import { getCandidates, approveCandidate } from '../../services/recruitmentApi';
import '../../styles/recruitment.css';

const SKILL_LEVELS  = ['', 'unskilled', 'skilled', 'highly_skilled'];
const DEPARTMENTS   = ['', 'HR', 'Production', 'Maintenance', 'Quality', 'Safety', 'Admin', 'Logistics', 'IT'];

const RoundBadge = ({ c }) => {
  if (c.round21Status === 'passed') return <span className="badge badge-r2">Cleared Test (2.1)</span>;
  if (c.round22Status === 'passed') return <span className="badge badge-r2">Cleared Interview (2.2)</span>;
  return <span className="badge badge-pending">Pending</span>;
};

export default function Round3Department() {
  const [candidates, setCandidates]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [filterSkill, setFilterSkill]     = useState('');
  const [filterContractor, setFilterContractor] = useState('');
  const [contractors, setContractors]     = useState([]);
  const [signModal, setSignModal]         = useState(null); // candidate object
  const [sigFile, setSigFile]             = useState(null);
  const [remarks, setRemarks]             = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [toast, setToast]                 = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ round: 3 });
      setCandidates(data);
      // collect unique contractors from data
      const ctrs = {};
      data.forEach(c => { if (c.contractor) ctrs[c.contractor.id] = c.contractor; });
      setContractors(Object.values(ctrs));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = candidates.filter(c => {
    if (filterDept       && c.department          !== filterDept)       return false;
    if (filterSkill      && c.skillLevel           !== filterSkill)      return false;
    if (filterContractor && String(c.contractorId) !== filterContractor) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.aadharNo.includes(search)) return false;
    }
    return true;
  });

  const pending  = filtered.filter(c => c.overallStatus !== 'APPROVED');
  const approved = filtered.filter(c => c.overallStatus === 'APPROVED');

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!signModal) return;
    setSubmitting(true);
    try {
      await approveCandidate(signModal.id, sigFile, remarks);
      showToast('success', `${signModal.name} approved successfully.`);
      setSignModal(null);
      setSigFile(null);
      setRemarks('');
      load();
    } catch {
      showToast('error', 'Approval failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-panel" style={{ maxWidth: 1040 }}>
      <div className="rec-header">
        <h2 className="rec-title">Round 3 — Department Approval</h2>
        <p className="rec-sub">Final stage. Review shortlisted candidates and approve with digital signature.</p>
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
          <input className="rec-search" placeholder="Search name or Aadhar no…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="rec-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d || 'All Departments'}</option>)}
        </select>
        <select className="rec-filter-select" value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
          {SKILL_LEVELS.map(s => <option key={s} value={s}>{s ? s.replace('_',' ') : 'All Skills'}</option>)}
        </select>
        <select className="rec-filter-select" value={filterContractor} onChange={e => setFilterContractor(e.target.value)}>
          <option value="">All Contractors</option>
          {contractors.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>↻</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Awaiting Approval', val: pending.length,  color: '#fbbf24' },
          { label: 'Approved',          val: approved.length, color: '#4ade80' },
          { label: 'Total in Round 3',  val: filtered.length, color: '#818cf8' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: 'DM Serif Display, serif' }}>{s.val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending table */}
      {loading ? (
        <div className="rec-empty"><div className="rec-empty-icon"><svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg></div><p>Loading…</p></div>
      ) : pending.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <p>All candidates have been reviewed.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-accent)', marginBottom: 10 }}>
            Awaiting Approval — {pending.length}
          </div>
          <div className="rec-table-wrap" style={{ marginBottom: 32 }}>
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Aadhar</th>
                  <th>Department</th>
                  <th>Skill</th>
                  <th>Contractor</th>
                  <th>Cleared Via</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="cand-profile" style={{ gap: 10 }}>
                        <div className="cand-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem', borderRadius: 9 }}>
                          {c.photoPath ? <img src={`http://localhost:5009/${c.photoPath}`} alt={c.name} /> : c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="cand-name" style={{ fontSize: '0.875rem' }}>{c.name}</div>
                          <div className="cand-meta">{c.qualification} · {c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{c.aadharNo}</td>
                    <td>{c.department || '—'}</td>
                    <td>{c.skillLevel ? <span className="badge badge-r2">{c.skillLevel.replace('_',' ')}</span> : '—'}</td>
                    <td>{c.contractor?.name || '—'}</td>
                    <td><RoundBadge c={c} /></td>
                    <td>
                      <button className="rec-btn rec-btn-primary rec-btn-sm" onClick={() => setSignModal(c)}>
                        ✍ Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Approved table */}
      {approved.length > 0 && (
        <>
          <div className="rec-divider" />
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#4ade80', marginBottom: 10 }}>
            Approved — {approved.length}
          </div>
          <div className="rec-table-wrap">
            <table className="rec-table">
              <thead>
                <tr><th>Candidate</th><th>Department</th><th>Skill</th><th>Contractor</th><th>Cleared Via</th><th>Status</th></tr>
              </thead>
              <tbody>
                {approved.map(c => (
                  <tr key={c.id}>
                    <td className="name-cell">{c.name}</td>
                    <td>{c.department || '—'}</td>
                    <td>{c.skillLevel ? <span className="badge badge-r2">{c.skillLevel.replace('_',' ')}</span> : '—'}</td>
                    <td>{c.contractor?.name || '—'}</td>
                    <td><RoundBadge c={c} /></td>
                    <td><span className="badge badge-approved">✓ Approved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Digital Signature Modal ──────────────────────────────────────── */}
      {signModal && (
        <div className="rec-modal-overlay">
          <div className="rec-modal" style={{ maxWidth: 520 }}>
            <h3 className="rec-modal-title">Approve Candidate</h3>
            <p className="rec-modal-sub">Upload your digital signature to confirm approval of this candidate.</p>

            {/* Candidate mini-profile */}
            <div className="cand-profile" style={{ marginBottom: 24, padding: '14px 16px', background: 'var(--bg-sidebar)', borderRadius: 12, border: '1px solid var(--border-main)' }}>
              <div className="cand-avatar" style={{ width: 48, height: 48, borderRadius: 12 }}>
                {signModal.photoPath ? <img src={`http://localhost:5009/${signModal.photoPath}`} alt={signModal.name} /> : signModal.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="cand-name">{signModal.name}</div>
                <p className="cand-meta">
                  {signModal.aadharNo} · {signModal.department} · {signModal.skillLevel?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Signature upload */}
            <div className="rec-field" style={{ marginBottom: 16 }}>
              <label className="rec-label">Digital Signature <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400, fontSize: '0.7rem' }}>(image file)</span></label>
              <div className="rec-file-wrap">
                <label className="rec-file-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {sigFile ? 'Change' : 'Upload Signature'}
                  <input type="file" accept="image/*" onChange={e => setSigFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <span className="rec-file-name">{sigFile?.name || 'No file chosen'}</span>
              </div>
            </div>

            {/* Remarks */}
            <div className="rec-field" style={{ marginBottom: 0 }}>
              <label className="rec-label">Remarks <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400, fontSize: '0.7rem' }}>(optional)</span></label>
              <textarea
                className="rec-textarea"
                placeholder="e.g. Candidate cleared all rounds. Recommended for onboarding."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                style={{ minHeight: 72 }}
              />
            </div>

            <div className="rec-modal-actions">
              <button className="rec-btn rec-btn-ghost" onClick={() => { setSignModal(null); setSigFile(null); setRemarks(''); }}>
                Cancel
              </button>
              <button className="rec-btn rec-btn-primary" onClick={handleApprove} disabled={submitting}>
                {submitting
                  ? <><svg className="rec-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg> Approving…</>
                  : '✓ Confirm Approval'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}