// Routes dành cho Teacher (giáo viên)
import TeacherDashboard from "../../features/teacher/pages/TeacherDashboard";
import AIQuestionGenerator from "../../features/teacher/pages/AIQuestionGenerator";
import ExamManagement from "../../features/teacher/pages/ExamManagement";
import QuestionManagement from "../../features/teacher/pages/QuestionManagement";
import { RoleBasedRoute } from "../guards";

const teacherRoutes = [
  {
    path: "teacher/dashboard",
    element: (
      <RoleBasedRoute allowedRoles={["TEACHER"]}>
        <TeacherDashboard />
      </RoleBasedRoute>
    ),
  },
  {
    path: "teacher/exams",
    element: (
      <RoleBasedRoute allowedRoles={["TEACHER"]}>
        <ExamManagement />
      </RoleBasedRoute>
    ),
  },
  {
    path: "teacher/questions",
    element: (
      <RoleBasedRoute allowedRoles={["TEACHER"]}>
        <QuestionManagement />
      </RoleBasedRoute>
    ),
  },
  {
    path: "teacher/ai-generator",
    element: (
      <RoleBasedRoute allowedRoles={["TEACHER"]}>
        <AIQuestionGenerator />
      </RoleBasedRoute>
    ),
  },
];

export default teacherRoutes;
