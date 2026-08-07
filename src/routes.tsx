import { useEffect } from 'react';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Dashboard from './pages/users/Dashboard';
import Tasks from './pages/users/Tasks';
import Notifications from './pages/users/Notifications';
import Attendance from './pages/users/Attendance';
import Chats from './pages/users/Chats';
import ApplyLeave from './pages/users/ApplyLeave';
import Meetings from './pages/users/Meetings';
import Settings from './pages/users/Settings';
import Payroll from './pages/users/Payroll';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAdmins from './pages/admin/ManageAdmins';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminDepartments from './pages/admin/AdminDepartments';
import UserDepartments from './pages/users/UserDepartments';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import AdminSettings from './pages/admin/AdminSettings';
import PastEmployees from './pages/admin/PastEmployees';
import AdminHolidays from './pages/admin/AdminHolidays';
import AdminTasks from './pages/admin/AdminTasks';
import AdminMeetings from './pages/admin/AdminMeetings';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/error/Unauthorized';
import NotFound from './pages/error/NotFound';
import ResetPassword from './pages/auth/ResetPassword';
import ForgotPassword from './pages/auth/ForgotPassword';
import Verify2FA from './pages/auth/Verify2FA';
import TwoFactorGuard from './components/TwoFactorGuard';
import Overview from './pages/Overview';
import People from './pages/People';
import Documents from './pages/Documents';
import Requests from './pages/Requests';
import Knowledge from './pages/Knowledge';
import Support from './pages/Support';

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-2fa",
    element: <Verify2FA />,
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "people",
        element: <People />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "requests",
        element: <Requests />,
      },
      {
        path: "knowledge",
        element: <Knowledge />,
      },
      {
        path: "support",
        element: <Support />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "chats",
        element: <Chats />,
      },
      {
        path: "leave",
        element: <ApplyLeave />,
      },
      {
        path: "departments",
        element: <UserDepartments />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "payroll",
        element: <Payroll />,
      },
      {
        path: "meetings",
        element: <Meetings />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
        <TwoFactorGuard>
          <AdminLayout />
        </TwoFactorGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "",
        element: <Overview />,
      },
      // {
      //   path: "overview",
      //   element: <Overview />,
      // },
      {
        path: "people",
        element: <People />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "requests",
        element: <Requests />,
      },
      {
        path: "knowledge",
        element: <Knowledge />,
      },
      {
        path: "support",
        element: <Support />,
      },
      {
        path: "employees",
        element: <Navigate to="/admin/people" replace />,
      },
      {
        path: "departments",
        element: <AdminDepartments />,
      },
      {
        path: "leaves",
        element: <AdminLeaves />,
      },
      {
        path: "manage-admins",
        element: <ManageAdmins />,
      },
      {
        path: "attendance",
        element: <AdminAttendance />,
      },
      {
        path: "payroll",
        element: <AdminPayroll />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
      {
        path: "past-employees",
        element: <PastEmployees />,
      },
      {
        path: "holidays",
        element: <AdminHolidays />,
      },
      {
        path: "tasks",
        element: <AdminTasks />,
      },
      {
        path: "chats",
        element: <Chats />,
      },
      {
        path: "meetings",
        element: <AdminMeetings />,
      },
    ],
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

const pageTitles: Record<string, string> = {
  "/login": "Login",
  "/reset-password": "Reset Password",
  "/forgot-password": "Forgot Password",
  "/verify-2fa": "Verify 2FA",
  "/user": "Dashboard",
  "/user/overview": "Overview",
  "/user/people": "People",
  "/user/documents": "Documents",
  "/user/requests": "Requests",
  "/user/knowledge": "Knowledge",
  "/user/support": "Support",
  "/user/tasks": "Tasks",
  "/user/notifications": "Notifications",
  "/user/attendance": "Attendance",
  "/user/chats": "Chats",
  "/user/leave": "Apply Leave",
  "/user/departments": "Departments",
  "/user/settings": "Settings",
  "/user/payroll": "Payroll",
  "/user/meetings": "Meetings",
  "/admin": "Admin Dashboard",
  "/admin/overview": "Overview",
  "/admin/people": "People",
  "/admin/documents": "Documents",
  "/admin/requests": "Requests",
  "/admin/knowledge": "Knowledge",
  "/admin/support": "Support",
  "/admin/employees": "Employees",
  "/admin/departments": "Departments",
  "/admin/leaves": "Leaves",
  "/admin/manage-admins": "Manage Admins",
  "/admin/attendance": "Attendance",
  "/admin/payroll": "Payroll",
  "/admin/settings": "Settings",
  "/admin/past-employees": "Past Employees",
  "/admin/holidays": "Holidays",
  "/admin/tasks": "Tasks",
  "/admin/chats": "Chats",
  "/admin/meetings": "Meetings",
  "/unauthorized": "Unauthorized",
};

const getPageTitle = (pathname: string) => {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return pageTitles[normalizedPath] ?? "Page Not Found";
};

const AppRoutes = () => {
  const location = useLocation();
  const element = useRoutes(routes);

  useEffect(() => {
    document.title = `Meridian HR - ${getPageTitle(location.pathname)}`;
  }, [location.pathname]);

  return element;
};

export default AppRoutes;
