import { useEffect, useState } from "react";
import { getCandidates, approveCandidate } from "../../services/recruitmentApi";
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

export default function FinalApproval() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [contractors, setContractors] = useState([]);
  const [signModal, setSignModal] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ status: "IN_ROUND3" });
      setCandidates(data);

      const ctrs = {};
      data.forEach((c) => {
        if (c.contractor) ctrs[c.contractor.id] = c.contractor;
      });
      setContractors(Object.values(ctrs));
    } catch (err) {
      console.error("Failed to load final approval candidates:", err);
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

  const handleApprove = async () => {
    if (!signModal) return;

    setSubmitting(true);
    try {
      await approveCandidate(signModal.id, sigFile, remarks);
      showToast("success", `${signModal.name} approved successfully.`);
      setSignModal(null);
      setSigFile(null);
      setRemarks("");
      load();
    } catch (err) {
      console.error("Approval failed:", err);
      showToast("error", err?.response?.data?.message || "Approval failed.");
    } finally {
      setSubmitting(false);
    }
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

  const withEmpId = filtered.filter((c) => !!c.employeeId).length;
  const signedCount = filtered.filter((c) => !!c.signaturePath).length;
  const unsignedCount = filtered.filter((c) => !c.signaturePath).length;

  return (
    <div className="view-panel" style={{ maxWidth: 1180 }}>
      <div className="rec-header">
        <h2 className="rec-title">Final Approval</h2>
        <p className="rec-sub">
          Final review and approval for candidates who completed department review. [cite:38][cite:41]
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
        <StatCard label="Ready for Approval" value={filtered.length} note="Candidates available for final approval." color="#16a34a" />
        <StatCard label="Employee ID Assigned" value={withEmpId} note="Candidates with employee IDs filled in Round 3." color="#0ea5e9" />
        <StatCard label="Signed" value={signedCount} note="Candidates already carrying a signature." color="#4f46e5" />
        <StatCard label="Unsigned" value={unsignedCount} note="Candidates still awaiting signature upload." color="#f59e0b" />
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

          <select className="rec-filter-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d || "All Departments"}
              </option>
            ))}
          </select>

          <select className="rec-filter-select" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
            {SKILL_LEVELS.map((s) => (
              <option key={s} value={s}>
                {s ? s.replace("_", " ") : "All Skills"}
              </option>
            ))}
          </select>

          <select className="rec-filter-select" value={filterContractor} onChange={(e) => setFilterContractor(e.target.value)}>
            <option value="">All Contractors</option>
            {contractors.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <button type="button" className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>
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
          <p>Loading final approval candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p>No candidates are ready for final approval.</p>
        </div>
      ) : (
        <>
          <div className="rec-section-label">Final Approval Queue • {filtered.length} candidate{filtered.length > 1 ? "s" : ""}</div>

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
                        <div className="cand-avatar" style={{ width: 42, height: 42, fontSize: "0.95rem", borderRadius: 10 }}>
                          {c.photoPath ? (
                            <img src={`http://localhost:5009/${c.photoPath}`} alt={c.name} />
                          ) : (
                            c.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="cand-name">{c.name}</div>
                          <div className="cand-meta">
                            {c.qualification || "Qualification not added"} · {c.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="rec-mono">{c.aadharNo}</td>
                    <td className="rec-mono">{c.employeeId || "—"}</td>
                    <td className="rec-cell-muted">{c.department || "—"}</td>
                    <td>
                      {c.skillLevel ? (
                        <span className="badge badge-r2">{c.skillLevel.replace("_", " ")}</span>
                      ) : (
                        <span className="rec-cell-muted">—</span>
                      )}
                    </td>
                    <td className="rec-cell-muted">{c.contractor?.name || "—"}</td>
                    <td><RoundBadge c={c} /></td>
                    <td>
                      <button
                        type="button"
                        className="rec-btn rec-btn-primary rec-btn-sm"
                        onClick={() => setSignModal(c)}
                      >
                        ✓ Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {signModal && (
        <div className="rec-modal-overlay">
          <div className="rec-modal" style={{ maxWidth: 540 }}>
            <h3 className="rec-modal-title">Approve Candidate</h3>
            <p className="rec-modal-sub">
              Upload a signature image and add optional remarks before confirming final approval. [cite:41]
            </p>

            <div className="rec-inline-card">
              <div className="cand-profile">
                <div className="cand-avatar" style={{ width: 52, height: 52, borderRadius: 12 }}>
                  {signModal.photoPath ? (
                    <img src={`http://localhost:5009/${signModal.photoPath}`} alt={signModal.name} />
                  ) : (
                    signModal.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="cand-name">{signModal.name}</div>
                  <p className="cand-meta">
                    {signModal.aadharNo} · {signModal.department || "No department"} · {signModal.skillLevel?.replace("_", " ") || "No skill"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rec-field" style={{ marginBottom: 16 }}>
              <label className="rec-label">
                Digital Signature <span className="opt">(image file)</span>
              </label>
              <div className="rec-file-wrap">
                <label className="rec-file-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {sigFile ? "Change file" : "Upload signature"}
                  <input type="file" accept="image/*" onChange={(e) => setSigFile(e.target.files[0])} />
                </label>
                <span className="rec-file-name">{sigFile?.name || "No file chosen"}</span>
              </div>
            </div>

            <div className="rec-field">
              <label className="rec-label">
                Remarks <span className="opt">(optional)</span>
              </label>
              <textarea
                className="rec-textarea"
                placeholder="Candidate cleared all required checks and is recommended for onboarding."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ minHeight: 84 }}
              />
            </div>

            <div className="rec-modal-actions">
              <button
                type="button"
                className="rec-btn rec-btn-ghost"
                onClick={() => {
                  setSignModal(null);
                  setSigFile(null);
                  setRemarks("");
                }}
              >
                Cancel
              </button>
              <button type="button" className="rec-btn rec-btn-primary" onClick={handleApprove} disabled={submitting}>
                {submitting ? (
                  <>
                    <svg className="rec-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    Approving...
                  </>
                ) : (
                  "✓ Confirm Approval"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}