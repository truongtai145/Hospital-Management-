// src/routes/RoutesConfig.jsx
import { lazy } from "react";
import { PATHS } from "./path";
import { lazyLoadFromModule } from "./lazyLoadModule";

// ==================== EAGER LOAD: Auth (nhỏ, cần nhanh) ====================
import { Login, Register, ForgotPassword } from "../pages/auth";

// ==================== EAGER LOAD: Public Pages (critical path) ====================
const Home = lazy(() => import("../pages/Home"));
const ServicePage = lazy(() => import("../pages/Services/ServicePage"));
const Doctor = lazy(() => import("../pages/Doctor/DoctorPage"));
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
const NewsPage = lazy(() => import("../pages/Blog/BlogPage"));
const SingleNewsPage = lazy(() => import("../pages/Blog/SingleNewsPage"));
const Appointment = lazy(() => import("../components/Appointment/Appointment"));
const Chat = lazy(() => import("../components/Chat/Chat"));

// ==================== LAZY LOAD: Admin Module ====================
const AdminDashboard = lazyLoadFromModule(() => import("../pages/Admin"), "AdminDashboard");
const AdminAppointments = lazyLoadFromModule(() => import("../pages/Admin"), "AdminAppointments");
const AdminAppointmentDetail = lazyLoadFromModule(() => import("../pages/Admin"), "AdminAppointmentDetail");
const AdminDoctors = lazyLoadFromModule(() => import("../pages/Admin"), "AdminDoctors");
const AdminDoctorDetail = lazyLoadFromModule(() => import("../pages/Admin"), "AdminDoctorDetail");
const AdminPatients = lazyLoadFromModule(() => import("../pages/Admin"), "AdminPatients");
const AdminPatientDetail = lazyLoadFromModule(() => import("../pages/Admin"), "AdminPatientDetail");
const AdminPayments = lazyLoadFromModule(() => import("../pages/Admin"), "AdminPayments");
const AdminDepartments = lazyLoadFromModule(() => import("../pages/Admin"), "AdminDepartments");
const AdminChat = lazyLoadFromModule(() => import("../pages/Admin"), "AdminChat");

// ==================== LAZY LOAD: Doctor Module ====================
const DoctorLayout = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorLayout");
const DoctorDashboard = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorDashboard");
const DoctorProfile = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorProfile");
const DoctorAppointments = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorAppointments");
const AppointmentDetail = lazyLoadFromModule(() => import("../pages/Doctors"), "AppointmentDetail");
const DoctorPatients = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorPatients");
const DoctorPatientDetail = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorPatientDetail");
const DoctorChat = lazyLoadFromModule(() => import("../pages/Doctors"), "DoctorChat");

// ==================== LAZY LOAD: Patient Module ====================
const PatientProfile = lazyLoadFromModule(() => import("../pages/Patient"), "PatientProfile");
const AppointmentHistory = lazyLoadFromModule(() => import("../pages/Patient"), "AppointmentHistory");
const PatientPayments = lazyLoadFromModule(() => import("../pages/Patient"), "PatientPayments");
const PaymentResult = lazyLoadFromModule(() => import("../pages/Patient"), "PaymentResult");

export const ROUTES_CONFIG = [
  // ==================== AUTH (EAGER) ====================
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
  {
    path: PATHS.FORGOTPASSWORD,
    element: ForgotPassword,
    layout: "none",
  },

  // ==================== PUBLIC PAGES ====================
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
  {
    path: PATHS.APPOINTMENT,
    element: Appointment,
    layout: "public",
  },

  // ==================== PATIENT MODULE (LAZY) ====================
  {
    path: PATHS.PATIENT_PROFILE,
    element: PatientProfile,
    layout: "public",
    isPrivate: true,
    roles: ["patient"],
  },
  {
    path: PATHS.PATIENT_APPOINTMENT_HISTORY,
    element: AppointmentHistory,
    layout: "public",
    isPrivate: true,
    roles: ["patient"],
  },
  {
    path: PATHS.PATIENT_PAYMENTS,
    element: PatientPayments,
    layout: "public",
    isPrivate: true,
    roles: ["patient"],
  },
  {
    path: "/payment-result",
    element: PaymentResult,
    layout: "public",
    isPrivate: true,
    roles: ["patient"],
  },

  // ==================== ADMIN MODULE (LAZY - FLAT STRUCTURE) ====================
  {
    path: PATHS.ADMIN,
    element: AdminDashboard,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_APPOINTMENTS,
    element: AdminAppointments,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_APPOINTMENT_DETAIL,
    element: AdminAppointmentDetail,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_DOCTORS,
    element: AdminDoctors,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_DOCTOR_DETAIL,
    element: AdminDoctorDetail,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_PATIENTS,
    element: AdminPatients,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_PATIENT_DETAIL,
    element: AdminPatientDetail,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_PAYMENTS,
    element: AdminPayments,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_CHAT,
    element: AdminChat,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },
  {
    path: PATHS.ADMIN_DEPARTMENTS,
    element: AdminDepartments,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
  },

  // ==================== DOCTOR MODULE (LAZY - NESTED ROUTES) ====================
  {
    path: PATHS.DOCTOR_DASHBOARD,
    element: DoctorLayout,
    layout: "none",
    isPrivate: true,
    roles: ["doctor"],
    children: [
      {
        index: true,
        element: DoctorDashboard,
      },
      {
        path: PATHS.DOCTOR_PROFILE,
        element: DoctorProfile,
      },
      {
        path: PATHS.DOCTOR_APPOINTMENTS,
        element: DoctorAppointments,
      },
      {
        path: PATHS.DOCTOR_APPOINTMENT_DETAIL,
        element: AppointmentDetail,
      },
      {
        path: PATHS.DOCTOR_PATIENTS,
        element: DoctorPatients,
      },
      {
        path: PATHS.DOCTOR_PATIENT_DETAIL,
        element: DoctorPatientDetail,
      },
      {
        path: PATHS.DOCTOR_CHAT,
        element: DoctorChat,
      },
    ],
  },

  // ==================== SHARED: CHAT ====================
  {
    path: PATHS.CHAT,
    element: Chat,
    layout: "public", 
    isPrivate: true,
    roles: ["patient", "doctor", "admin"],
  },

  // ==================== 404 ====================
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