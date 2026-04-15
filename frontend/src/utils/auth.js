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

export const hasPermission = (permission) => {
  if (!permission) return true;
  return getPermissions().includes(permission);
};

export const hasAnyPermission = (permissions = []) => {
  const currentPermissions = getPermissions();
  return permissions.some((permission) => currentPermissions.includes(permission));
};

export const hasAllPermissions = (permissions = []) => {
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