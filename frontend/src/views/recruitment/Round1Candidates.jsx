import { useEffect, useState } from 'react';
import { getCandidates, moveToRound2 } from '../../services/recruitmentApi';
import '../../styles/recruitment.css';

export default function Round1Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCandidates({ round: 1, status: 'PENDING' });
      setCandidates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMoveToTest = async (selectedIds) => {
    if (!selectedIds.length) return;
    setSubmitting(true);
    try {
      await moveToRound2(selectedIds, 'test');
      showToast('success', `${selectedIds.length} moved to Test Queue`);
      load();
    } catch (err) {
      showToast('error', 'Failed to move candidates');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveToInterview = async (selectedIds) => {
    if (!selectedIds.length) return;
    setSubmitting(true);
    try {
      await moveToRound2(selectedIds, 'interview');
      showToast('success', `${selectedIds.length} moved to Interview Panel`);
      load();
    } catch (err) {
      showToast('error', 'Failed to move candidates');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = candidates.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.aadharNo.includes(search)
  );

  return (
    <div className="view-panel" style={{ maxWidth: '900px' }}>
      <div className="rec-header">
        <h2 className="rec-title">Round 1 — New Candidates</h2>
        <p className="rec-sub">
          Review new form submissions. Move to Test Queue or Interview Panel.
        </p>
      </div>

      {toast && (
        <div className={`rec-toast rec-toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="12" y1="6" x2="12.01" y2="6" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="rec-filter-bar">
        <div className="rec-search-wrap">
          <span className="rec-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="rec-search"
            placeholder="Search by name or Aadhar no"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1 -6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
          <p>Loading candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p>No new candidates in Round 1 queue.</p>
        </div>
      ) : (
        <div className="rec-table-wrap">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              className="rec-btn rec-btn-success rec-btn-sm"
              disabled={submitting}
              onClick={() => handleMoveToTest(filtered.map(c => c.id))}
            >
              {submitting ? 'Moving...' : `Move All to Test (${filtered.length})`}
            </button>
            <button
              className="rec-btn rec-btn-primary rec-btn-sm"
              disabled={submitting}
              onClick={() => handleMoveToInterview(filtered.map(c => c.id))}
            >
              {submitting ? 'Moving...' : `Move All to Interview (${filtered.length})`}
            </button>
          </div>

          <table className="rec-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Phone</th>
                <th>Aadhar No.</th>
                <th>Qualification</th>
                <th>Experience</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="cand-profile" style={{ gap: '12px' }}>
                      <div className="cand-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem', borderRadius: '9px' }}>
                        {c.photoPath ? (
                          <img src={`http://localhost:5009/${c.photoPath}`} alt={`${c.name}`} />
                        ) : (
                          c.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="cand-name" style={{ fontSize: '0.875rem' }}>{c.name}</div>
                        <div className="cand-meta">{c.qualification}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.aadharNo}</td>
                  <td>{c.qualification}</td>
                  <td>
                    {c.hasExperience ? 'Yes' : 'No'}
                    {c.prevCompany && ` (${c.prevCompany})`}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="rec-btn rec-btn-success rec-btn-sm"
                        disabled={submitting}
                        onClick={() => handleMoveToTest([c.id])}
                      >
                        Test
                      </button>
                      <button
                        className="rec-btn rec-btn-primary rec-btn-sm"
                        disabled={submitting}
                        onClick={() => handleMoveToInterview([c.id])}
                      >
                        Interview
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}