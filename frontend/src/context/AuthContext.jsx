import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("auth-user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("auth-user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
  };

  const hasPermission = (permissionKey) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys = []) => {
    if (!user?.permissions) return false;
    return permissionKeys.some((key) => user.permissions.includes(key));
  };

  const value = useMemo(() => ({
    user,
    loginUser,
    logoutUser,
    hasPermission,
    hasAnyPermission,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}