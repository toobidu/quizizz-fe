import authStore from "../stores/authStore";
import { formatRoleName, getRoleColor, getRoleIcon } from "../utils/roleUtils";
import "./RoleBadge.css";

/**
 * RoleBadge - Component hiển thị badge role của user
 * Có thể dùng trong header, profile, etc.
 */
const RoleBadge = ({ showIcon = true, showText = true, size = "medium" }) => {
  const typeAccount = authStore((state) => state.typeAccount);

  if (!typeAccount) return null;

  const roleName = formatRoleName(typeAccount);
  const roleColor = getRoleColor(typeAccount);
  const roleIcon = getRoleIcon(typeAccount);

  return (
    <div
      className={`role-badge role-badge--${size}`}
      style={{ backgroundColor: roleColor }}
      title={roleName}
    >
      {showIcon && <span className="role-badge__icon">{roleIcon}</span>}
      {showText && <span className="role-badge__text">{roleName}</span>}
    </div>
  );
};

export default RoleBadge;
