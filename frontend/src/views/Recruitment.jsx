// frontend/src/views/recruitment/Recruitment.jsx (PATHS FIXED)
import { useState, useEffect } from 'react';
import NewCandidateForm from './recruitment/NewCandidateForm';
import Round2Test       from './recruitment/Round2Test';
import Round2Interview  from './recruitment/Round2Interview';
import Round3Department from './recruitment/Round3Department';
import '../styles/recruitment.css';

// ── Permission-aware tabs ─────────────────────────────────────────────────────
function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setPermissions(user.permissions || []);
    } catch {
      setPermissions([]);
    }
  }, []);

  const hasPermission = (key) => permissions.includes(key);
  return { permissions, hasPermission };
}

const TABS = [
  { id: 'new', label: 'New Candidate', icon: '＋', sub: 'Round 1', permission: 'recruitment.create' },
  { id: 'r21', label: 'Test Queue',    icon: '✎',  sub: 'Round 2.1', permission: 'recruitment.round2.test.view' },
  { id: 'r22', label: 'Interview',     icon: '👥', sub: 'Round 2.2', permission: 'recruitment.round2.interview.view' },
  { id: 'r3',  label: 'Dept Approval', icon: '✍',  sub: 'Round 3', permission: 'recruitment.round3.view' },
];

export default function Recruitment() {
  const [tab, setTab] = useState('new');
  const { hasPermission } = usePermissions();

  // Filter tabs by permission
  const filteredTabs = TABS.filter(t => !t.permission || hasPermission(t.permission));

  // Default to first available tab
  useEffect(() => {
    if (!filteredTabs.find(t => t.id === tab)) {
      setTab(filteredTabs[0]?.id || 'new');
    }
  }, [filteredTabs]);

  // Called by NewCandidateForm after successful submission
  const handleNewSuccess = (round2Type) => {
    if (round2Type === 'test' && hasPermission('recruitment.round2.test.view'))      setTab('r21');
    else if (round2Type === 'interview' && hasPermission('recruitment.round2.interview.view')) setTab('r22');
  };

  if (filteredTabs.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h3>No Recruitment Access</h3>
        <p>Contact admin for recruitment permissions.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Tab bar - only show permitted tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 32,
        borderBottom: '1px solid var(--border-main)',
      }}>
        {filteredTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              padding: '10px 18px 12px',
              background: tab === t.id ? 'rgba(99,102,241,0.06)' : 'transparent',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: '-1px',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: tab === t.id ? 'var(--text-accent)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {t.icon} {t.label}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif', marginLeft: 20 }}>
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content - only render permitted content */}
      {tab === 'new' && hasPermission('recruitment.create') && <NewCandidateForm onSuccess={handleNewSuccess} />}
      {tab === 'r21' && hasPermission('recruitment.round2.test.view') && <Round2Test />}
      {tab === 'r22' && hasPermission('recruitment.round2.interview.view') && <Round2Interview />}
      {tab === 'r3'  && hasPermission('recruitment.round3.view') && <Round3Department />}
    </div>
  );
}