import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginUser = (userData, token = null) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const hasPermission = (permissionKey) => {
  if (user?.isSuperAdmin) return true;
  if (!user?.permissions) return false;
  return user.permissions.includes(permissionKey);
};

  const hasAnyPermission = (permissionKeys = []) => {
  if (user?.isSuperAdmin) return true;
  if (!user?.permissions) return false;
  return permissionKeys.some((key) => user.permissions.includes(key));
};

  const value = useMemo(
    () => ({
      user,
      loginUser,
      logoutUser,
      hasPermission,
      hasAnyPermission,
      isAuthenticated: !!user,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}