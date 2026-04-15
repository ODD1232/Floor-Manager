import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import { dashboardRoutes } from "./config/routeConfig";
import { isAuthenticated, hasPermission } from "./utils/auth";

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function PermissionRoute({ permission, children }) {
  return hasPermission(permission) ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <div className="page-card">
              <div className="page-header">
                <div>
                  <h2 className="page-title">Welcome to Dashboard</h2>
                  <p className="page-subtitle">
                    Choose a module from the sidebar to continue.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        {dashboardRoutes.flatMap((group) =>
          group.children.map((route) => {
            const Component = route.element;

            return (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <PermissionRoute permission={route.permission}>
                    <Component />
                  </PermissionRoute>
                }
              />
            );
          })
        )}
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;