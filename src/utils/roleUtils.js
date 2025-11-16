/**
 * Role Utilities
 * Các helper functions để làm việc với roles/permissions
 */

// Constants
export const ROLES = {
  PLAYER: "PLAYER",
  TEACHER: "TEACHER",
  ADMIN: "ADMIN",
};

// Role hierarchy (cao → thấp)
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.TEACHER]: 2,
  [ROLES.PLAYER]: 1,
};

// Dashboard routes theo role
export const ROLE_DASHBOARDS = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.TEACHER]: "/teacher/dashboard",
  [ROLES.PLAYER]: "/dashboard",
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {string} userRole - Role của user
 * @param {string} requiredRole - Role yêu cầu
 * @returns {boolean}
 */
export const hasRole = (userRole, requiredRole) => {
  return userRole === requiredRole;
};

/**
 * Kiểm tra user có một trong các roles không
 * @param {string} userRole - Role của user
 * @param {string[]} allowedRoles - Danh sách roles được phép
 * @returns {boolean}
 */
export const hasAnyRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Kiểm tra role có cao hơn role khác không
 * @param {string} userRole - Role của user
 * @param {string} compareRole - Role để so sánh
 * @returns {boolean}
 */
export const isRoleHigherThan = (userRole, compareRole) => {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[compareRole];
};

/**
 * Lấy dashboard path theo role
 * @param {string} role - Role của user
 * @returns {string}
 */
export const getDashboardPath = (role) => {
  return ROLE_DASHBOARDS[role] || "/";
};

/**
 * Kiểm tra user có thể truy cập route không
 * @param {string} userRole - Role của user
 * @param {string[]} allowedRoles - Danh sách roles được phép
 * @returns {boolean}
 */
export const canAccessRoute = (userRole, allowedRoles) => {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return hasAnyRole(userRole, allowedRoles);
};

/**
 * Format role name để hiển thị
 * @param {string} role - Role
 * @returns {string}
 */
export const formatRoleName = (role) => {
  const roleNames = {
    [ROLES.PLAYER]: "Người chơi",
    [ROLES.TEACHER]: "Giáo viên",
    [ROLES.ADMIN]: "Quản trị viên",
  };
  return roleNames[role] || role;
};

/**
 * Lấy màu badge theo role
 * @param {string} role - Role
 * @returns {string}
 */
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.PLAYER]: "#3b82f6", // blue
    [ROLES.TEACHER]: "#10b981", // green
    [ROLES.ADMIN]: "#ef4444", // red
  };
  return roleColors[role] || "#6b7280"; // gray
};

/**
 * Lấy icon theo role
 * @param {string} role - Role
 * @returns {string}
 */
export const getRoleIcon = (role) => {
  const roleIcons = {
    [ROLES.PLAYER]: "🎮",
    [ROLES.TEACHER]: "👨‍🏫",
    [ROLES.ADMIN]: "👑",
  };
  return roleIcons[role] || "👤";
};

export default {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_DASHBOARDS,
  hasRole,
  hasAnyRole,
  isRoleHigherThan,
  getDashboardPath,
  canAccessRoute,
  formatRoleName,
  getRoleColor,
  getRoleIcon,
};
