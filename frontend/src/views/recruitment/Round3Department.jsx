// frontend/src/views/recruitment/Round3Department.jsx
import { useEffect, useState } from "react";
import { getCandidates, updateRound3Details } from "../../services/recruitmentApi";
import "../../styles/recruitment.css";

const SKILL_LEVELS = ["", "unskilled", "skilled", "highly_skilled"];
const DEPARTMENTS = ["", "HR", "Production", "Maintenance", "Quality", "Safety", "Admin", "Logistics", "IT"];

const RoundBadge = ({ c }) => {
  if (c.round21Status === "passed") return <span className="badge badge-r2">Cleared Test (2.1)</span>;
  if (c.round22Status === "passed") return <span className="badge badge-r2">Cleared Interview (2.2)</span>;
  return <span className="badge badge-pending">Pending</span>;
};

const StatCard = ({ label, value, note, color }) => (
  <div className="rec-stat-card">
    <div className="rec-stat-top">
      <span className="rec-stat-label">{label}</span>
      <span className="rec-stat-dot" style={{ background: color }} />
    </div>
    <div className="rec-stat-value">{value}</div>
    <p className="rec-stat-meta">{note}</p>
  </div>
);

export default function Round3Department() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [contractors, setContractors] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [skill, setSkill] = useState("");
  const [dept, setDept] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ round: 3, status: "IN_ROUND3" });
      setCandidates(data);

      const ctrs = {};
      data.forEach((c) => {
        if (c.contractor) ctrs[c.contractor.id] = c.contractor;
      });
      setContractors(Object.values(ctrs));
    } catch (err) {
      console.error("Failed to load round 3 candidates:", err);
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

  const filtered = candidates.filter((c) => {
    if (filterDept && c.department !== filterDept) return false;
    if (filterSkill && c.skillLevel !== filterSkill) return false;
    if (filterContractor && String(c.contractorId) !== filterContractor) return false;

    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.aadharNo.includes(search)) return false;
    }

    return true;
  });

  const approvedWithSignature = filtered.filter((c) => !!c.signaturePath).length;
  const fromTest = filtered.filter((c) => c.round21Status === "passed").length;
  const fromInterview = filtered.filter((c) => c.round22Status === "passed").length;

  const handleEditSubmit = async () => {
    if (!editModal) return;

    setSubmitting(true);
    try {
      await updateRound3Details(editModal.id, {
        employeeId,
        skillLevel: skill,
        department: dept,
        remarks,
      });
      showToast("success", `${editModal.name} profile updated.`);
      setEditModal(null);
      setEmployeeId("");
      setSkill("");
      setDept("");
      setRemarks("");
      load();
    } catch (err) {
      console.error("Edit failed:", err);
      showToast("error", err?.response?.data?.message || "Edit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-panel" style={{ maxWidth: 1120 }}>
      <div className="rec-header">
        <h2 className="rec-title">Round 3 — Department Review</h2>
        <p className="rec-sub">
          Review candidates at the departmental stage, edit their profile, and assign Employee ID.
        </p>
      </div>

      {toast && (
        <div className={`rec-toast rec-toast-${toast.type}`}>
          {toast.type === "success" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <div className="rec-stat-grid">
        <StatCard
          label="Awaiting Review"
          value={filtered.length}
          note="Candidates currently in the Round 3 queue."
          color="#f59e0b"
        />
        <StatCard
          label="Cleared Test 2.1"
          value={fromTest}
          note="Came through the test route."
          color="#0891b2"
        />
        <StatCard
          label="Cleared Interview 2.2"
          value={fromInterview}
          note="Came through the interview route."
          color="#4f46e5"
        />
      </div>

      <div className="rec-card">
        <div className="rec-card-title">Filters</div>
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
              placeholder="Search by candidate name or Aadhar number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="rec-filter-select"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d || "All Departments"}
              </option>
            ))}
          </select>

          <select
            className="rec-filter-select"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            {SKILL_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s ? s.replace("_", " ") : "All Skills"}
              </option>
            ))}
          </select>

          <select
            className="rec-filter-select"
            value={filterContractor}
            onChange={(e) => setFilterContractor(e.target.value)}
          >
            <option value="">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
          <p>Loading department review candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p>No candidates are waiting for department review.</p>
        </div>
      ) : (
        <>
          <div className="rec-section-label">
            Review Queue • {filtered.length} candidate{filtered.length > 1 ? "s" : ""}
          </div>

          <div className="rec-table-wrap">
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Aadhar</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Skill</th>
                  <th>Contractor</th>
                  <th>Cleared Via</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="cand-profile">
                        <div
                          className="cand-avatar"
                          style={{ width: 42, height: 42, fontSize: "0.95rem", borderRadius: 10 }}
                        >
                          {c.photoPath ? (
                            <img
                              src={`http://localhost:5009/${c.photoPath}`}
                              alt={c.name}
                            />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="cand-name">{c.name}</div>
                          <div className="cand-meta">
                            {c.qualification || "Qualification not added"} ·{" "}
                            {c.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="rec-mono">{c.aadharNo}</td>
                    <td className="rec-mono">
                      {c.employeeId || <span className="rec-cell-muted">—</span>}
                    </td>
                    <td className="rec-cell-muted">{c.department || "—"}</td>
                    <td>
                      {c.skillLevel ? (
                        <span className="badge badge-r2">{c.skillLevel.replace("_", " ")}</span>
                      ) : (
                        <span className="rec-cell-muted">—</span>
                      )}
                    </td>
                    <td className="rec-cell-muted">{c.contractor?.name || "—"}</td>
                    <td>
                      <RoundBadge c={c} />
                    </td>
                    <td>
                      <button
                        className="rec-btn rec-btn-primary rec-btn-sm"
                        onClick={() => {
                          setEditModal(c);
                          setEmployeeId(c.employeeId || "");
                          setSkill(c.skillLevel || "");
                          setDept(c.department || "");
                          setRemarks(c.remarks || "");
                        }}
                      >
                        ✏ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editModal && (
        <div className="rec-modal-overlay">
          <div className="rec-modal" style={{ maxWidth: 540 }}>
            <h3 className="rec-modal-title">Edit Candidate Profile</h3>
            <p className="rec-modal-sub">
              Update this candidate’s profile, assign Employee ID, and add remarks.
            </p>

            <div className="rec-inline-card">
              <div className="cand-profile">
                <div
                  className="cand-avatar"
                  style={{ width: 52, height: 52, borderRadius: 12 }}
                >
                  {editModal.photoPath ? (
                    <img
                      src={`http://localhost:5009/${editModal.photoPath}`}
                      alt={editModal.name}
                    />
                  ) : (
                    editModal.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="cand-name">{editModal.name}</div>
                  <p className="cand-meta">
                    {editModal.aadharNo} · {editModal.department || "No department"} ·
                    {editModal.skillLevel?.replace("_", " ") || "No skill"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rec-field" style={{ marginBottom: 16 }}>
              <label className="rec-label">Employee ID</label>
              <input
                className="rec-input"
                placeholder="EMP-123"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            <div className="rec-field" style={{ marginBottom: 16 }}>
              <label className="rec-label">Department</label>
              <select
                className="rec-select"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d || "Not set"}
                  </option>
                ))}
              </select>
            </div>

            <div className="rec-field" style={{ marginBottom: 16 }}>
              <label className="rec-label">Skill Level</label>
              <select
                className="rec-select"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s ? s.replace("_", " ") : "Not set"}
                  </option>
                ))}
              </select>
            </div>

            <div className="rec-field">
              <label className="rec-label">
                Remarks <span className="opt">(optional)</span>
              </label>
              <textarea
                className="rec-textarea"
                placeholder="Comments on the candidate’s fit and readiness for onboarding."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ minHeight: 84 }}
              />
            </div>

            <div className="rec-modal-actions">
              <button
                className="rec-btn rec-btn-ghost"
                onClick={() => {
                  setEditModal(null);
                  setEmployeeId("");
                  setSkill("");
                  setDept("");
                  setRemarks("");
                }}
              >
                Cancel
              </button>
              <button
                className="rec-btn rec-btn-primary"
                onClick={handleEditSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="rec-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}