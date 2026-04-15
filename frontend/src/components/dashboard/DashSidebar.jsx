import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { dashboardRoutes } from "../../config/routeConfig";
import { hasPermission } from "../../utils/auth";

const DashSidebar = () => {
  const location = useLocation();

  const groups = useMemo(() => {
    return dashboardRoutes
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => hasPermission(item.permission)),
      }))
      .filter((group) => group.children.length > 0);
  }, []);

  const getInitialOpenMenus = () => {
    const state = {};
    groups.forEach((group) => {
      state[group.id] = group.children.some((child) =>
        location.pathname.startsWith(child.to)
      );
    });
    return state;
  };

  const [openMenus, setOpenMenus] = useState(getInitialOpenMenus);

  const toggleMenu = (groupId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#111827" }}>Admin Panel</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280" }}>
          Role based navigation
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="dash-empty">No accessible modules found.</p>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="dash-nav-group">
            <button
              type="button"
              className="dash-nav-item"
              onClick={() => toggleMenu(group.id)}
            >
              <span className="dash-nav-item-inner">
                <span>{group.label}</span>
              </span>

              <span className={`nav-chevron ${openMenus[group.id] ? "open" : ""}`}>
                ▾
              </span>
            </button>

            {openMenus[group.id] ? (
              <div className="dash-submenu">
                {group.children.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    className={({ isActive }) =>
                      `dash-nav-subitem ${isActive ? "active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
};

export default DashSidebar;