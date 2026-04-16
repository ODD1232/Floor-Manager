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
      <div className="dash-brand">
        <h2 className="dash-brand__title">Admin Panel</h2>
        <p className="dash-brand__sub">Role based navigation</p>
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