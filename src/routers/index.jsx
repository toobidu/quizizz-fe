import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPage from "../pages/ErrorPage";
import { RoleBasedRedirect } from "./guards";
import {
  publicRoutes,
  commonRoutes,
  playerRoutes,
  teacherRoutes,
  adminRoutes,
} from "./routes";

/**
 * Router Configuration
 * 
 * Cấu trúc:
 * - Public Routes: Không cần đăng nhập (/, /login, /register, ...)
 * - Common Routes: Cần đăng nhập nhưng không phân biệt role (/profile)
 * - Player Routes: Dành cho PLAYER (/dashboard, /rooms, /game, ...)
 * - Teacher Routes: Dành cho TEACHER (/teacher/dashboard, /teacher/topics, ...)
 * - Admin Routes: Dành cho ADMIN (/admin/dashboard, /admin/users, ...)
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // Public routes - không cần đăng nhập
      ...publicRoutes,

      // Auto redirect based on role
      {
        path: "auto-redirect",
        element: <RoleBasedRedirect />,
      },

      // Common routes - cần đăng nhập, không phân biệt role
      ...commonRoutes,

      // Player routes - chỉ dành cho PLAYER
      ...playerRoutes,

      // Teacher routes - chỉ dành cho TEACHER
      ...teacherRoutes,

      // Admin routes - chỉ dành cho ADMIN
      ...adminRoutes,

      // Error page
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

export { router };