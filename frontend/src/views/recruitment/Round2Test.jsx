import { useEffect, useMemo, useState } from "react";
import {
  getCandidates,
  updateRound21,
  updateCandidateProfileFields,
} from "../../services/recruitmentApi";
import "../../styles/recruitment.css";

const SKILL_LEVELS = ["unskilled", "skilled", "highly_skilled"];
const DEPARTMENTS = [
  "HR",
  "Production",
  "Maintenance",
  "Quality",
  "Safety",
  "Admin",
  "Logistics",
  "IT",
];

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${String(status || "pending").toLowerCase()}`}>
    {status || "—"}
  </span>
);

export default function Round2Test() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [statuses, setStatuses] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterContractor, setFilterContractor] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ skillLevel: "", department: "" });
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCandidates({ status: "IN_ROUND2" });
      setCandidates(data.filter((c) => c.round2Type === "test"));
      setSelected(new Set());
      setStatuses({});
    } catch {
      showToast("Failed to load candidates.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const contractors = useMemo(() => {
    const seen = new Map();
    candidates.forEach((c) => {
      if (c.contractor?.id && !seen.has(c.contractor.id)) {
        seen.set(c.contractor.id, c.contractor);
      }
    });
    return [...seen.values()];
  }, [candidates]);

  const filtered = candidates
    .filter((c) => {
      if (filterDept && c.department !== filterDept) return false;
      if (filterSkill && c.skillLevel !== filterSkill) return false;
      if (
        filterContractor &&
        String(c.contractor?.id || "") !== String(filterContractor)
      ) {
        return false;
      }

      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name?.toLowerCase().includes(q) &&
          !c.aadharNo?.includes(search) &&
          !c.phone?.includes(search)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
      if (sortBy === "nameDesc") return b.name.localeCompare(a.name);
      return 0;
    });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const setStatus = (id, status) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const handleSubmit = async () => {
    const updates = Array.from(selected)
      .filter((id) => statuses[id])
      .map((id) => ({ id, status: statuses[id] }));

    if (!updates.length) {
      showToast("Set pass/fail status for at least one selected candidate.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await updateRound21(updates);
      showToast(`${updates.length} candidate(s) updated.`, "success");
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || "Update failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (candidate) => {
    setEditingId(candidate.id);
    setEditForm({
      skillLevel: candidate.skillLevel || "",
      department: candidate.department || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ skillLevel: "", department: "" });
  };

  const saveEdit = async (id) => {
    if (!editForm.skillLevel || !editForm.department) {
      showToast("Please select both skill level and department.", "error");
      return;
    }

    setSavingEdit(true);
    try {
      const { data } = await updateCandidateProfileFields(id, editForm);

      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? data.candidate : c))
      );

      showToast("Candidate updated successfully.", "success");
      cancelEdit();
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to update candidate.",
        "error"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="rec-empty">
        <div className="rec-empty-icon">⏳</div>
        <p>Loading test candidates…</p>
      </div>
    );
  }

  return (
    <div className="view-panel" style={{ maxWidth: 1060 }}>
      <div className="rec-header">
        <h1 className="rec-title">Round 2.1 Test Queue</h1>
        <p className="rec-sub">
          Candidates ready for technical assessment. Select candidates, set test
          result, then move forward.
        </p>
      </div>

      {toast && (
        <div className={`rec-toast rec-toast-${toast.type}`}>
          <span>✓</span> {toast.message}
        </div>
      )}

      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {selected.size} selected
          </span>
          <button
            className="rec-btn rec-btn-primary rec-btn-sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            → Move Selected Forward
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rec-empty">
          <div className="rec-empty-icon">🧪</div>
          <p>No pending test candidates.</p>
        </div>
      ) : (
        <>
          <div className="rec-table-head">
            <div className="rec-section-label">
              Pending Test Candidates • {filtered.length}
            </div>

            <div className="rec-table-corner-filters">
              <div className="rec-search-wrap rec-search-wrap-sm">
                <span className="rec-search-icon">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  className="rec-search rec-search-sm"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="rec-filter-select rec-filter-select-sm"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="">All Depts</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                className="rec-filter-select rec-filter-select-sm"
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
              >
                <option value="">All Skills</option>
                {SKILL_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <select
                className="rec-filter-select rec-filter-select-sm"
                value={filterContractor}
                onChange={(e) => setFilterContractor(e.target.value)}
              >
                <option value="">All Contractors</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                className="rec-filter-select rec-filter-select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="nameAsc">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
              </select>

              <button className="rec-btn rec-btn-ghost rec-btn-sm" onClick={load}>
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="rec-table-wrap">
            <table className="rec-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="rec-checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Candidate</th>
                  <th>Phone</th>
                  <th>Aadhar</th>
                  <th>Dept</th>
                  <th>Skill</th>
                  <th>Contractor</th>
                  <th>Test</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className={selected.has(candidate.id) ? "selected" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="rec-checkbox"
                        checked={selected.has(candidate.id)}
                        onChange={() => toggleSelect(candidate.id)}
                      />
                    </td>

                    <td>
                      <div className="cand-profile" style={{ gap: 10 }}>
                        <div
                          className="cand-avatar"
                          style={{
                            width: 34,
                            height: 34,
                            fontSize: "0.85rem",
                            borderRadius: 8,
                          }}
                        >
                          {candidate.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <div
                            className="cand-name"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {candidate.name}
                          </div>
                          <div className="cand-meta">{candidate.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                      {candidate.aadharNo}
                    </td>

                    <td>
                      {editingId === candidate.id ? (
                        <select
                          className="rec-filter-select"
                          value={editForm.department}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              department: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select</option>
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      ) : (
                        candidate.department || "—"
                      )}
                    </td>

                    <td>
                      {editingId === candidate.id ? (
                        <select
                          className="rec-filter-select"
                          value={editForm.skillLevel}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              skillLevel: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select</option>
                          {SKILL_LEVELS.map((s) => (
                            <option key={s} value={s}>
                              {s.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      ) : candidate.skillLevel ? (
                        <span className="badge badge-r2">
                          {candidate.skillLevel.replaceAll("_", " ")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{candidate.contractor?.name || "—"}</td>

                    <td>
                      <select
                        className="rec-filter-select"
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                        value={statuses[candidate.id] || ""}
                        onChange={(e) => {
                          setStatus(candidate.id, e.target.value);
                          if (!selected.has(candidate.id)) toggleSelect(candidate.id);
                        }}
                      >
                        <option value="">Select</option>
                        <option value="passed">Pass</option>
                        <option value="failed">Fail</option>
                      </select>
                    </td>

                    <td>
                      {editingId === candidate.id ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="rec-btn rec-btn-primary rec-btn-sm"
                            onClick={() => saveEdit(candidate.id)}
                            disabled={savingEdit}
                          >
                            {savingEdit ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="rec-btn rec-btn-ghost rec-btn-sm"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="rec-btn rec-btn-ghost rec-btn-sm"
                          onClick={() => startEdit(candidate)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}