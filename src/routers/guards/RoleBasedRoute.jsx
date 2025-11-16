import { Navigate } from "react-router-dom";
import authStore from "../../stores/authStore";
import ProtectedRoute from "./ProtectedRoute";

/**
 * RoleBasedRoute - Component bảo vệ route dựa trên vai trò
 * @param {string[]} allowedRoles - Danh sách các role được phép truy cập
 * @param {string} redirectTo - Đường dẫn redirect nếu không có quyền (mặc định: /dashboard)
 */
const RoleBasedRoute = ({ children, allowedRoles, redirectTo = "/dashboard" }) => {
  const user = authStore((state) => state.user);

  return (
    <ProtectedRoute>
      {allowedRoles.includes(user?.role) ? (
        children
      ) : (
        <Navigate to={redirectTo} replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleBasedRoute;
