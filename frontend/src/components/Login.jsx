import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ employeeId: "", password: "" });
  const [showPassword, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      const payload = res.data?.data || res.data;

      if (!payload?.user) {
        throw new Error("User object missing in login response");
      }

      loginUser(payload.user, payload.token);

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h2 style={{ margin: 0, color: "#111827" }}>Login</h2>
          <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "14px" }}>
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "#374151",
                fontWeight: 500,
              }}
            >
              Employee ID
            </label>
            <input
              type="text"
              placeholder="Enter employee ID"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employeeId: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                color: "#374151",
                fontWeight: 500,
              }}
            >
              Password
            </label>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPwd((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error ? (
            <p
              style={{
                margin: 0,
                color: "#dc2626",
                fontSize: "14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "10px 12px",
                borderRadius: "10px",
              }}
            >
              {error}
            </p>
          ) : null}

          {success ? (
            <p
              style={{
                margin: 0,
                color: "#166534",
                fontSize: "14px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "10px 12px",
                borderRadius: "10px",
              }}
            >
              Login successful. Redirecting...
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#9ca3af" : "#111827",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;