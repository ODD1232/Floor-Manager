export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getPermissions = () => {
  const user = getUser();
  return Array.isArray(user?.permissions) ? user.permissions : [];
};

export const isSuperAdmin = () => {
  const user = getUser();
  return user?.isSuperAdmin === true;
};

export const hasPermission = (permission) => {
  if (!permission) return true;
  if (isSuperAdmin()) return true;
  return getPermissions().includes(permission);
};

export const hasAnyPermission = (permissions = []) => {
  if (isSuperAdmin()) return true;
  const currentPermissions = getPermissions();
  return permissions.some((permission) => currentPermissions.includes(permission));
};

export const hasAllPermissions = (permissions = []) => {
  if (isSuperAdmin()) return true;
  const currentPermissions = getPermissions();
  return permissions.every((permission) => currentPermissions.includes(permission));
};

export const isAuthenticated = () => {
  return !!getUser();
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};