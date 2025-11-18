// Routes dành cho Admin (quản trị viên)
import { AdminDashboard } from "../../features/admin/pages";
import UserManagement from "../../features/admin/pages/UserManagement";
import RoleManagement from "../../features/admin/pages/RoleManagement";
import PermissionManagement from "../../features/admin/pages/PermissionManagement";
import TopicManagement from "../../features/admin/pages/TopicManagement";
import { RoleBasedRoute } from "../guards";

const adminRoutes = [
  {
    path: "admin/dashboard",
    element: (
      <RoleBasedRoute allowedRoles={["ADMIN"]}>
        <AdminDashboard />
      </RoleBasedRoute>
    ),
  },
  {
    path: "admin/users",
    element: (
      <RoleBasedRoute allowedRoles={["ADMIN"]}>
        <UserManagement />
      </RoleBasedRoute>
    ),
  },
  {
    path: "admin/roles",
    element: (
      <RoleBasedRoute allowedRoles={["ADMIN"]}>
        <RoleManagement />
      </RoleBasedRoute>
    ),
  },
  {
    path: "admin/permissions",
    element: (
      <RoleBasedRoute allowedRoles={["ADMIN"]}>
        <PermissionManagement />
      </RoleBasedRoute>
    ),
  },
  {
    path: "admin/topics",
    element: (
      <RoleBasedRoute allowedRoles={["ADMIN"]}>
        <TopicManagement />
      </RoleBasedRoute>
    ),
  },
];

export default adminRoutes;
