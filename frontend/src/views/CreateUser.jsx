import { useEffect, useState } from "react";
import api from "../services/api";

const CreateUser = () => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roleError, setRoleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    roleId: "",
    password: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        setRoleError("");

        const res = await api.get("/roles-mgmt");
        const data = Array.isArray(res.data) ? res.data : [];
        setRoles(data);
      } catch (err) {
        setRoleError(err.response?.data?.message || "Failed to load roles");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        roleId: formData.roleId,
        password: formData.password,
      };

      const res = await api.post("/auth/admin-register", payload);

      setSubmitSuccess(res.data?.message || "User created successfully");

      setFormData({
        name: "",
        employeeId: "",
        roleId: "",
        password: "",
      });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Create User</h2>
          <p className="page-subtitle">
            Add a new employee account and assign the required access.
          </p>
        </div>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Employee ID</label>
          <input
            className="form-input"
            type="text"
            name="employeeId"
            placeholder="Enter employee ID"
            value={formData.employeeId}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="form-input"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            disabled={loadingRoles}
          >
            <option value="">
              {loadingRoles ? "Loading roles..." : "Select role"}
            </option>

            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {roleError ? (
            <p style={{ marginTop: "6px", color: "red", fontSize: "13px" }}>
              {roleError}
            </p>
          ) : null}
        </div>

        <div className="form-group form-group--full">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {submitError ? (
          <p style={{ color: "red", fontSize: "14px" }}>{submitError}</p>
        ) : null}

        {submitSuccess ? (
          <p style={{ color: "green", fontSize: "14px" }}>{submitSuccess}</p>
        ) : null}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;