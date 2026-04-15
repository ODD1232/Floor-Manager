import { useEffect, useState } from "react";
import { getCandidates } from "../../services/recruitmentApi";
import "../../styles/recruitment.css";

const SKILL_LEVELS = ["", "unskilled", "skilled", "highly_skilled"];
const DEPARTMENTS = ["", "HR", "Production", "Maintenance", "Quality", "Safety", "Admin", "Logistics", "IT"];

const RoundBadge = ({ c }) => {
  if (c.round21Status === "passed") return <span className="badge badge-r2">Cleared Test (2.1)</span>;
  if (c.round22Status === "passed") return <span className="badge badge-r2">Cleared Interview (2.2)</span>;
  return <span className="badge badge-pending">Pending</span>;
};

export default function FinalApproval() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [contractors, setContractors] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ status: "APPROVED" });
      setCandidates(data);

      const ctrs = {};
      data.forEach((c) => {
        if (c.contractor) ctrs[c.contractor.id] = c.contractor;
      });
      setContractors(Object.values(ctrs));
    } catch (err) {
      console.error("Failed to load approved candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="view-panel" style={{ maxWidth: 1040 }}>
      <div className="rec-header">
        <h2 className="rec-title">Final Approval</h2>
        <p className="rec-sub">
          Candidates approved in Round 3. This page is the final approved list.
        </p>
      </div>

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
            placeholder="Search name or Aadhar no…"
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

        <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>
          ↻
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Final Approved", val: filtered.length, color: "#4ade80" },
          { label: "Signed", val: filtered.filter((c) => !!c.signaturePath).length, color: "#818cf8" },
          { label: "Unsigned", val: filtered.filter((c) => !c.signaturePath).length, color: "#fbbf24" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              borderRadius: 12,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: s.color,
                fontFamily: "DM Serif Display, serif",
              }}
            >
              {s.val}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg className="rec-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </div>
          <p>Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p>No final approved candidates found.</p>
        </div>
      ) : (
        <div className="rec-table-wrap">
          <table className="rec-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Aadhar</th>
                <th>Department</th>
                <th>Skill</th>
                <th>Contractor</th>
                <th>Cleared Via</th>
                <th>Approved At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="cand-profile" style={{ gap: 10 }}>
                      <div className="cand-avatar" style={{ width: 36, height: 36, fontSize: "0.9rem", borderRadius: 9 }}>
                        {c.photoPath ? (
                          <img src={`http://localhost:5009/${c.photoPath}`} alt={c.name} />
                        ) : (
                          c.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="cand-name" style={{ fontSize: "0.875rem" }}>{c.name}</div>
                        <div className="cand-meta">{c.qualification} · {c.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{c.aadharNo}</td>
                  <td>{c.department || "—"}</td>
                  <td>{c.skillLevel ? <span className="badge badge-r2">{c.skillLevel.replace("_", " ")}</span> : "—"}</td>
                  <td>{c.contractor?.name || "—"}</td>
                  <td><RoundBadge c={c} /></td>
                  <td>{c.signedAt ? new Date(c.signedAt).toLocaleString() : "—"}</td>
                  <td><span className="badge badge-approved">✓ Approved</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}