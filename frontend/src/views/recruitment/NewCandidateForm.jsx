// frontend/src/views/recruitment/NewCandidateForm.jsx  (FULL REPLACEMENT)
import { useEffect, useState } from 'react';
import { createCandidate, getContractors } from '../../services/recruitmentApi';
import '../../styles/recruitment.css';

const SKILL_LEVELS = ['unskilled', 'skilled', 'highly_skilled'];
const DEPARTMENTS  = ['HR', 'Production', 'Maintenance', 'Quality', 'Safety', 'Admin', 'Logistics', 'IT'];

const FileField = ({ label, name, accept, optional, onChange, value }) => (
  <div className="rec-field">
    <label className="rec-label">
      {label}
      {optional && <span className="opt"> (optional)</span>}
    </label>
    <div className="rec-file-wrap">
      <label className="rec-file-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        {value ? 'Change' : 'Upload'}
        <input type="file" name={name} accept={accept} onChange={onChange} style={{ display: 'none' }} />
      </label>
      <span className="rec-file-name">{value?.name || 'No file chosen'}</span>
    </div>
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="rec-toggle-wrap" onClick={onChange}>
    <div className={`rec-toggle ${checked ? 'on' : ''}`} />
    <span>{label}</span>
  </div>
);

export default function NewCandidateForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', phone: '', aadharNo: '', qualification: '',
    skillLevel: '', department: '',
    hasExperience: false, prevPosition: '', prevCompany: '', prevLocation: '',
    wasOnContract: false, contractDuration: '', contractorId: '',
    round2Type: '',
  });

  const [files, setFiles] = useState({
    photo: null, aadharPhoto: null, resume: null,
    experienceLetter: null, relevanceLetter: null,
  });

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    getContractors().then(r => setContractors(r.data)).catch(() => {});
  }, []);

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setF = k => e => setFiles(p => ({ ...p, [k]: e.target.files[0] || null }));
  const tog  = k => () => setForm(p => ({ ...p, [k]: !p[k] }));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.round2Type) {
      showToast('error', 'Please select the next round type (Test or Interview).');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

    try {
      await createCandidate(fd);
      showToast('success', 'Candidate registered and moved to Round 2!');
      setForm({
        name:'', phone:'', aadharNo:'', qualification:'',
        skillLevel:'', department:'',
        hasExperience:false, prevPosition:'', prevCompany:'', prevLocation:'',
        wasOnContract:false, contractDuration:'', contractorId:'',
        round2Type:'',
      });
      setFiles({ photo:null, aadharPhoto:null, resume:null, experienceLetter:null, relevanceLetter:null });
      // Switch to appropriate round tab after success
      setTimeout(() => onSuccess?.(form.round2Type), 1500);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const isClassified = !!(form.skillLevel && form.department);

  return (
    <div className="view-panel" style={{ maxWidth: 800 }}>
      <div className="rec-header">
        <h2 className="rec-title">New Candidate — Round 1</h2>
        <p className="rec-sub">Register a candidate. They will immediately enter Round 2 upon submission.</p>
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

      <form onSubmit={handleSubmit}>

        {/* ── Section 1: Basic Info ── */}
        <div className="rec-card">
          <div className="rec-card-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Basic Information
          </div>
          <div className="rec-grid-2" style={{ marginBottom: 16 }}>
            <div className="rec-field">
              <label className="rec-label">Full Name</label>
              <input className="rec-input" required placeholder="e.g. Rahul Sharma" value={form.name} onChange={set('name')} />
            </div>
            <div className="rec-field">
              <label className="rec-label">Phone Number</label>
              <input className="rec-input" required placeholder="10-digit mobile" value={form.phone} onChange={set('phone')} maxLength={10} />
            </div>
            <div className="rec-field">
              <label className="rec-label">Aadhar Number</label>
              <input className="rec-input" required placeholder="12-digit Aadhar no." value={form.aadharNo} onChange={set('aadharNo')} maxLength={12} />
            </div>
            <div className="rec-field">
              <label className="rec-label">Qualification</label>
              <input className="rec-input" required placeholder="e.g. B.Tech, ITI, 12th" value={form.qualification} onChange={set('qualification')} />
            </div>
          </div>
          <div className="rec-grid-3">
            <FileField label="Candidate Photo" name="photo" accept="image/*" onChange={setF('photo')} value={files.photo} />
            <FileField label="Aadhar Card Photo" name="aadharPhoto" accept="image/*" onChange={setF('aadharPhoto')} value={files.aadharPhoto} />
            <FileField label="Resume (PDF/Image)" name="resume" accept=".pdf,image/*" onChange={setF('resume')} value={files.resume} />
          </div>
        </div>

        {/* ── Section 2: Classification ── */}
        <div className="rec-card">
          <div className="rec-card-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Classification
            {!isClassified && (
              <span style={{ marginLeft: 8, fontSize: '0.7rem', fontWeight: 500, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 6, padding: '2px 8px' }}>
                ⚠ Unclassified — candidate won't reach Round 3 until filled
              </span>
            )}
          </div>
          <div className="rec-grid-2">
            <div className="rec-field">
              <label className="rec-label">Skill Level</label>
              <select className="rec-select" value={form.skillLevel} onChange={set('skillLevel')}>
                <option value="">— Not set (unclassified) —</option>
                {SKILL_LEVELS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="rec-field">
              <label className="rec-label">Department</label>
              <select className="rec-select" value={form.department} onChange={set('department')}>
                <option value="">— Not set (unclassified) —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section 3: Experience ── */}
        <div className="rec-card">
          <div className="rec-card-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            Work Experience
          </div>
          <Toggle label="Has prior work experience" checked={form.hasExperience} onChange={tog('hasExperience')} />
          {form.hasExperience && (
            <div style={{ marginTop: 20 }}>
              <div className="rec-grid-3" style={{ marginBottom: 16 }}>
                <div className="rec-field">
                  <label className="rec-label">Previous Position</label>
                  <input className="rec-input" placeholder="e.g. Operator" value={form.prevPosition} onChange={set('prevPosition')} />
                </div>
                <div className="rec-field">
                  <label className="rec-label">Company Name</label>
                  <input className="rec-input" placeholder="e.g. Tata Motors" value={form.prevCompany} onChange={set('prevCompany')} />
                </div>
                <div className="rec-field">
                  <label className="rec-label">Location</label>
                  <input className="rec-input" placeholder="City, State" value={form.prevLocation} onChange={set('prevLocation')} />
                </div>
              </div>
              <div className="rec-grid-2">
                <FileField label="Experience Letter" name="experienceLetter" accept=".pdf,image/*" optional onChange={setF('experienceLetter')} value={files.experienceLetter} />
                <FileField label="Relevance Letter" name="relevanceLetter" accept=".pdf,image/*" optional onChange={setF('relevanceLetter')} value={files.relevanceLetter} />
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4: Contract ── */}
        <div className="rec-card">
          <div className="rec-card-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Contract Details
          </div>
          <Toggle label="Was / is on contract" checked={form.wasOnContract} onChange={tog('wasOnContract')} />
          {form.wasOnContract && (
            <div className="rec-grid-2" style={{ marginTop: 20 }}>
              <div className="rec-field">
                <label className="rec-label">Contract Duration</label>
                <input className="rec-input" placeholder="e.g. 6 months" value={form.contractDuration} onChange={set('contractDuration')} />
              </div>
              <div className="rec-field">
                <label className="rec-label">Contractor / Agency</label>
                <select className="rec-select" value={form.contractorId} onChange={set('contractorId')}>
                  <option value="">Select contractor…</option>
                  {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 5: Next Round selection ── */}
        <div className="rec-card" style={{ borderColor: form.round2Type ? 'rgba(99,102,241,0.4)' : 'rgba(251,191,36,0.4)' }}>
          <div className="rec-card-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            Submit To — Select Next Round
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { val: 'test',      label: 'Round 2.1 — Written / Skill Test', icon: '✎', desc: 'Candidate will appear in the Test Queue' },
              { val: 'interview', label: 'Round 2.2 — Interview Panel',       icon: '👥', desc: 'Candidate will appear in the Interview Panel' },
            ].map(opt => (
              <label key={opt.val} style={{
                flex: 1, display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                background: form.round2Type === opt.val ? 'rgba(99,102,241,0.1)' : 'var(--bg-input)',
                border: `1px solid ${form.round2Type === opt.val ? 'rgba(99,102,241,0.45)' : 'var(--border-input)'}`,
                transition: 'all 0.15s',
              }}>
                <input
                  type="radio"
                  name="round2Type"
                  value={opt.val}
                  checked={form.round2Type === opt.val}
                  onChange={set('round2Type')}
                  style={{ marginTop: 2, accentColor: '#6366f1' }}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {opt.icon} {opt.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="submit" className="rec-btn rec-btn-primary" disabled={loading || !form.round2Type}>
            {loading
              ? <><svg className="rec-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg> Submitting…</>
              : <>Register &amp; Move to {form.round2Type === 'test' ? 'Round 2.1' : form.round2Type === 'interview' ? 'Round 2.2' : 'Round 2'} →</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}