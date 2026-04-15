import { Navigate } from "react-router-dom";
import { getUser, hasPermission } from "../utils/auth";

export default function RequirePermission({ permission, children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return (
      <div style={{ padding: 48 }}>
        <h2>Access denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
}