// Routes dùng chung cho tất cả users (không yêu cầu role cụ thể)
import Profile from "../../pages/Profile";
import { ProtectedRoute } from "../guards";

const commonRoutes = [
  {
    path: "profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
];

export default commonRoutes;
