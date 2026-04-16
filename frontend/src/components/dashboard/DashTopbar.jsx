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
    <div className="dash-topbar-shell">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </p>
      </div>

      <div className="dash-topbar-actions">
        <div className="dash-user-meta">
          <div className="dash-user-name">{user?.name || "User"}</div>
          <div className="dash-user-id">
            {user?.employeeId || user?.email || "Logged in"}
          </div>
        </div>

        <button type="button" onClick={handleLogout} className="dash-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashTopbar;