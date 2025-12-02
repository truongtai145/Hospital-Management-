import { lazy } from "react";
import { PATHS } from "./path";

// --- Lazy Load Pages ---
const Home = lazy(() => import("../pages/Home")); 
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ServicePage = lazy(() => import("../pages/Services/ServicePage"));
const Doctor = lazy(() => import("../pages/Doctor/DoctorPage")); 
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
const NewsPage = lazy(() => import("../pages/Blog/BlogPage"));
const SingleNewsPage = lazy(() => import("../pages/Blog/SingleNewsPage"));


const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard/AdminDashboard"));
const DoctorPage = lazy(() => import("../pages/Doctors/DoctorDashboard/DoctorDashboard"));
export const ROUTES_CONFIG = [
  // --- AUTH ---
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

  // --- PUBLIC PAGES (Layout Header/Footer) ---
  {
    path: PATHS.HOME,
    element: Home,
    layout: "public", 
  },
  {
    path: PATHS.ABOUT,
    element: AboutPage,
    layout: "public",
  },
  {
    path: PATHS.SERVICES,
    element: ServicePage,
    layout: "public",
  },
  {
    path: PATHS.DOCTORS,
    element: Doctor,
    layout: "public",
  },
  {
    path: PATHS.NEWS,
    element: NewsPage,
    layout: "public",
  },
  {
    path: PATHS.NEWS_DETAIL,
    element: SingleNewsPage,
    layout: "public",
  },
  {
    path: PATHS.CONTACT,
    element: ContactPage,
    layout: "public",
  },

  // --- PRIVATE / ADMIN (Layout None hoặc AdminLayout sau này) ---
  {
    path: PATHS.ADMIN,
    element: AdminDashboard, // Nhớ bọc AdminLayout trong component này hoặc xử lý ở AppRoutes
    layout: "none", // Hoặc "admin" nếu bạn cấu hình layout riêng trong AppRoutes
  },

  // --- 404 ---
  {
    path: PATHS.NOT_FOUND,
    element: () => <div className="text-center mt-20 font-bold text-xl">404 - Trang không tồn tại</div>,
    layout: "public",
  },
  {
    path:PATHS.DOCTOR_DASHBOARD,
    element: DoctorPage,
    layout: "none",
  },
];