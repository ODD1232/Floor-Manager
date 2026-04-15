import { ThemeProvider } from "../context/ThemeContext";
import DashTopbar from "../components/dashboard/DashTopbar";
import DashSidebar from "../components/dashboard/DashSidebar";
import { Outlet } from "react-router-dom";
import "../styles/dashboard.css";

export default function AdminDashboard() {
  return (
    <ThemeProvider>
      <div className="admin-dashboard">
        <aside className="admin-dashboard__sidebar">
          <DashSidebar />
        </aside>

        <div className="admin-dashboard__main">
          <header className="admin-dashboard__topbar">
            <DashTopbar />
          </header>

          <main className="admin-dashboard__content">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}