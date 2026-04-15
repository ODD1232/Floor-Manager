import { useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../../utils/auth";

const DashTopbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: 1.2,
            color: "#111827",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          Welcome{user?.name ? `, ${user.name}` : ""}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {user?.name || "User"}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {user?.employeeId || user?.email || "Logged in"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashTopbar;