import { lazy } from "react";
import { PATHS } from "./path";

// --- Import Layouts ---
// Giả sử bạn có Layout chính (Header + Footer)
// Nếu chưa có file này, nó sẽ lấy Layout mình đã viết ở câu hỏi đầu tiên
import MainLayout from "../components/Layout/Layout";

// --- Public Pages (Lazy load) ---
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
// const Home = lazy(() => import("../components/Hero/Hero")); // Tạm dùng Hero làm Home
const Home = lazy(() => import("../pages/Home")); // Bạn nên tạo file Home.jsx gom các component lại
const Services = lazy(() => import("../pages/Services/ServicePage"));
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const Doctors = lazy(() => import("../pages/Doctor/DoctorPage"));
const Blog = lazy(() => import("../pages/Blog/BlogPage"));
const Contact = lazy(() => import("../pages/Contact/ContactPage"));
// --- Private Pages (Lazy load) ---
// const AdminDashboard = lazy(() => import("../pages/Admin/Dashboard"));
// const DoctorDashboard = lazy(() => import("../pages/Doctor/Dashboard"));
// const PatientDashboard = lazy(() => import("../pages/Patient/Dashboard"));

/**
 * Cấu trúc Config:
 * - path: Đường dẫn
 * - element: Component sẽ render
 * - layout:
 *    + 'public': Có Header/Footer (dùng MainLayout)
 *    + 'none': Không có gì (trang Login/Register/Admin)
 */

export const ROUTES_CONFIG = [
  {
    path: PATHS.LOGIN,
    element: Login,
    layout: "none",
  },
  {
    path: PATHS.REGISTER,
    element: Register,
    layout: "none",
  },

  // --- PUBLIC ROUTES (Có Layout) ---
  {
    path: PATHS.HOME,
    element: Home,
    layout: "public",
  },
  {
    path: PATHS.SERVICES,
    element: lazy(() => import("../pages/Services/ServicePage")), // Ví dụ load component Services
    layout: "public",
  },
  {
    path: PATHS.DOCTORS,
    element: lazy(() => import("../components/Doctors/Doctors")),
    layout: "public",
  },
  {
    path: PATHS.SERVICES,
    element: Services,
    layout: "public",
  },
  {
    path: PATHS.AboutPage,
    element: AboutPage,
    layout: "public",
  },
  {
    path: PATHS.Doctors,
    element: Doctors,
    layout: "public",
  },
  {
    path: PATHS.Blog,
    element: Blog,
    layout: "public",
  },
  {
    path: PATHS.CONTACT,
    element: Contact,
    layout: "public",
  },
  <Route path="/news/:id" element={<SingleNewsPage />} />,
  // --- DASHBOARD ROUTES (Tạm để none layout hoặc layout riêng sau này) ---
  {
    path: PATHS.ADMIN,
    element: () => (
      <div className="p-10 text-primary font-bold">Admin Dashboard</div>
    ), // Placeholder
    layout: "none",
  },
  {
    path: PATHS.DOCTOR,
    element: () => (
      <div className="p-10 text-secondary font-bold">Doctor Dashboard</div>
    ),
    layout: "none",
  },
  {
    path: PATHS.PATIENT,
    element: () => (
      <div className="p-10 text-green-600 font-bold">Patient Dashboard</div>
    ),
    layout: "public", // Bệnh nhân vẫn nên thấy Header/Footer
  },

  // --- 404 ---
  {
    path: PATHS.NOT_FOUND,
    element: () => (
      <div className="text-center mt-20 font-bold text-xl">
        404 - Trang không tồn tại
      </div>
    ),
    layout: "public",
  },
];
