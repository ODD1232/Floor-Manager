// frontend/src/views/RolesPermissions.jsx
import { useEffect, useState } from 'react';
import {
  getRolesMgmt, getAllPermissions,
  createRole, setRolePermissions, deleteRole,
} from '../services/recruitmentApi';
import '../styles/recruitment.css';

// Group permissions by their group field
const groupPerms = (perms) =>
  perms.reduce((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

// Group icon map
const GROUP_ICONS = {
  'Recruitment':         '👥',
  'User Management':     '👤',
  'Roles & Permissions': '🔐',
  'Settings':            '⚙',
};

export default function RolesPermissions() {
  const [roles, setRoles]           = useState([]);
  const [allPerms, setAllPerms]     = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);   // role object
  const [checked, setChecked]       = useState(new Set());  // permission keys currently toggled
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [creating, setCreating]     = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // role to delete

  const load = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([getRolesMgmt(), getAllPermissions()]);
      setRoles(rolesRes.data);
      setAllPerms(permsRes.data);
      // Keep selected role fresh
      if (selectedRole) {
        const fresh = rolesRes.data.find(r => r.id === selectedRole.id);
        if (fresh) selectRole(fresh, permsRes.data);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const selectRole = (role, perms = allPerms) => {
    setSelectedRole(role);
    const keys = new Set(role.rolePermissions?.map(rp => rp.permission.key) || []);
    setChecked(keys);
  };

  const togglePerm = (key) => {
    if (selectedRole?.name === 'super_admin') return; // lock super_admin
    setChecked(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  const toggleGroup = (groupPermsArr) => {
    if (selectedRole?.name === 'super_admin') return;
    const allChecked = groupPermsArr.every(p => checked.has(p.key));
    setChecked(prev => {
      const n = new Set(prev);
      groupPermsArr.forEach(p => allChecked ? n.delete(p.key) : n.add(p.key));
      return n;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await setRolePermissions(selectedRole.id, Array.from(checked));
      showToast('success', `Permissions saved for ${selectedRole.name}`);
      load();
    } catch {
      showToast('error', 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await createRole(newRoleName.trim());
      showToast('success', `Role ${newRoleName.toUpperCase()} created.`);
      setCreateModal(false);
      setNewRoleName('');
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to create role.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (role) => {
    try {
      await deleteRole(role.id);
      showToast('success', `Role ${role.name} deleted.`);
      if (selectedRole?.id === role.id) setSelectedRole(null);
      setDeleteConfirm(null);
      load();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Delete failed.');
      setDeleteConfirm(null);
    }
  };

  const grouped    = groupPerms(allPerms);
  const permCount  = (role) => role.rolePermissions?.length || 0;
  const isSuperAdmin = selectedRole?.name === 'super_admin';

  return (
    <div style={{ width: '100%', maxWidth: 1100 }}>
      <div className="rec-header">
        <h2 className="rec-title">Roles &amp; Permissions</h2>
        <p className="rec-sub">Create roles and assign granular permissions. Super Admin always has full access.</p>
      </div>

      {toast && (
        <div className={`rec-toast rec-toast-${toast.type}`} style={{ maxWidth: 480 }}>
          {toast.type === 'success'
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Left: Roles list ── */}
        <div>
          {/* Create role button */}
          <button
            className="rec-btn rec-btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
            onClick={() => setCreateModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Role
          </button>

          {/* Roles list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading && !roles.length ? (
              <div className="rec-empty" style={{ padding: 24 }}>
                <div className="rec-empty-icon" style={{ margin: '0 auto 12px' }}>
                  <svg className="rec-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg>
                </div>
                <p style={{ fontSize: '0.8rem' }}>Loading…</p>
              </div>
            ) : roles.map(role => (
              <div
                key={role.id}
                onClick={() => selectRole(role)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background: selectedRole?.id === role.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                  border: `1px solid ${selectedRole?.id === role.id ? 'rgba(99,102,241,0.4)' : 'var(--border-input)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: selectedRole?.id === role.id ? 'var(--text-accent)' : 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>
                      {role.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {permCount(role)} permission{permCount(role) !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {role.name === 'super_admin' && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 5, padding: '2px 7px', fontWeight: 600 }}>
                      🔒 System
                    </span>
                  )}
                  {role.name !== 'super_admin' && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteConfirm(role); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-label)', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-label)'}
                      title="Delete role"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Permissions panel ── */}
        <div>
          {!selectedRole ? (
            <div className="rec-empty" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 16, padding: 56 }}>
              <div className="rec-empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
              <p>Select a role to manage its permissions</p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Serif Display, serif' }}>
                    Permissions for {selectedRole.name}
                  </div>
                  {isSuperAdmin && (
                    <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: 2 }}>
                      🔒 Super Admin always has all permissions — cannot be edited
                    </div>
                  )}
                </div>
                {!isSuperAdmin && (
                  <button className="rec-btn rec-btn-primary rec-btn-sm" onClick={handleSave} disabled={saving}>
                    {saving
                      ? <><svg className="rec-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/></svg> Saving…</>
                      : '💾 Save Permissions'
                    }
                  </button>
                )}
              </div>

              {/* Permission groups */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {Object.entries(grouped).map(([group, perms]) => {
                  const allChecked = perms.every(p => checked.has(p.key));
                  const someChecked = perms.some(p => checked.has(p.key));

                  return (
                    <div key={group}>
                      {/* Group header with select-all */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isSuperAdmin ? 'default' : 'pointer' }} onClick={() => toggleGroup(perms)}>
                          <div style={{
                            width: 16, height: 16, borderRadius: 4, border: '1.5px solid',
                            borderColor: allChecked ? '#6366f1' : someChecked ? '#6366f1' : 'var(--border-input)',
                            background: allChecked ? '#6366f1' : someChecked ? 'rgba(99,102,241,0.3)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                            opacity: isSuperAdmin ? 0.5 : 1,
                          }}>
                            {(allChecked || someChecked) && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                {allChecked ? <polyline points="20 6 9 17 4 12"/> : <line x1="5" y1="12" x2="19" y2="12"/>}
                              </svg>
                            )}
                          </div>
                        </label>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-label)' }}>
                          {GROUP_ICONS[group] || '•'} {group}
                        </span>
                      </div>

                      {/* Permission checkboxes */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', paddingLeft: 8 }}>
                        {perms.map(perm => (
                          <label
                            key={perm.key}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isSuperAdmin ? 'default' : 'pointer', padding: '6px 0' }}
                            onClick={() => togglePerm(perm.key)}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: 4, border: '1.5px solid',
                              borderColor: checked.has(perm.key) ? '#6366f1' : 'var(--border-input)',
                              background: checked.has(perm.key) ? '#6366f1' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flex: '0 0 16px',
                              transition: 'all 0.15s',
                              opacity: isSuperAdmin ? 0.6 : 1,
                            }}>
                              {checked.has(perm.key) && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              )}
                            </div>
                            <span style={{ fontSize: '0.85rem', color: checked.has(perm.key) ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'color 0.15s' }}>
                              {perm.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Role Modal ── */}
      {createModal && (
        <div className="rec-modal-overlay">
          <div className="rec-modal">
            <h3 className="rec-modal-title">Create New Role</h3>
            <p className="rec-modal-sub">Name will be automatically uppercased (e.g. HR_MANAGER).</p>
            <div className="rec-field">
              <label className="rec-label">Role Name</label>
              <input
                className="rec-input"
                placeholder="e.g. HR_MANAGER"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateRole()}
                autoFocus
              />
            </div>
            <div className="rec-modal-actions">
              <button className="rec-btn rec-btn-ghost" onClick={() => { setCreateModal(false); setNewRoleName(''); }}>Cancel</button>
              <button className="rec-btn rec-btn-primary" onClick={handleCreateRole} disabled={creating || !newRoleName.trim()}>
                {creating ? 'Creating…' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="rec-modal-overlay">
          <div className="rec-modal">
            <h3 className="rec-modal-title">Delete Role?</h3>
            <p className="rec-modal-sub">
              Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>? All users assigned to this role will lose its permissions. This cannot be undone.
            </p>
            <div className="rec-modal-actions">
              <button className="rec-btn rec-btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="rec-btn rec-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}