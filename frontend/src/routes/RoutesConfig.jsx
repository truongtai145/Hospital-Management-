import { lazy } from "react";
import { PATHS } from "./path";

// --- Lazy Load Pages ---
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ServicePage = lazy(() => import("../pages/Services/ServicePage"));
const Doctor = lazy(() => import("../pages/Doctor/DoctorPage"));
const AboutPage = lazy(() => import("../pages/About/AboutPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
const NewsPage = lazy(() => import("../pages/Blog/BlogPage"));
const SingleNewsPage = lazy(() => import("../pages/Blog/SingleNewsPage"));
const PatientProfile = lazy(() => import("../pages/Patient/PatientProfile"));
const Appointment = lazy(() => import("../components/Appointment/Appointment"));
const AdminDashboard = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminDashboard")
);
const AppointmentHistory = lazy(() =>
  import("../pages/Patient/AppointmentHistory")
);

const DoctorLayout = lazy(() =>
  import("../pages/Doctors/Components/DoctorLayout")
);
const DoctorDashboard = lazy(() =>
  import("../pages/Doctors/DoctorDashboard/DoctorDashboard")
);
const DoctorProfile = lazy(() =>
  import("../pages/Doctors/DoctorDashboard/DoctorProfile")
);
const DoctorAppointments = lazy(() =>
  import("../pages/Doctors/DoctorDashboard/DoctorAppointments")
);
const AppointmentDetail = lazy(() =>
  import("../pages/Doctors/DoctorDashboard/AppointmentDetail")
);
const DoctorPatients = lazy(() =>
  import("../pages/Doctors/DoctorDashboard/DoctorPatient")
);
const AdminAppointments = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminAppointment")
);
const AdminDoctors = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminDoctors")
);
const AdminDoctorDetail = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminDoctorDetail")
);
const AdminPatients = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminPatients")
);
const AdminPatientDetail = lazy(() =>
  import("../pages/Admin/AdminDashboard/AdminPatientDetail")
);
const PatientPayments = lazy(() => import("../pages/Patient/PatientPayments"));
const AdminPayments = lazy(() => import("../pages/Admin/AdminDashboard/AdminPayments"));
const PaymentResult = lazy(() => import("../pages/Patient/PaymentResult"));
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
{
  path: PATHS.FORGOTPASSWORD,
  element: ForgotPassword,
  layout: "none",
},
  // --- PUBLIC PAGES ---
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
    path: PATHS.PATIENT_PROFILE,
    element: PatientProfile,
    layout: "public",
    isPrivate: true,
    roles: ["patient"],
  },
  {
    path: PATHS.APPOINTMENT,
    element: Appointment,
    layout: "public",
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

  // --- ADMIN ---
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
    path: PATHS.ADMIN_DOCTORS,
    element: AdminDoctors,
    layout: "none",
    isPrivate: true,
    roles: ["admin"],
    children: [
      {
        index: true,
        element: AdminDoctors,
      },
      { 
        path:PATHS.ADMIN_DOCTOR_DETAIL, 
        element: AdminDoctorDetail, 
      }
    ],
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
    children: [
      {
        index: true,
        element: AdminPatients,
      },
      {
        path:PATHS.ADMIN_PATIENT_DETAIL,
        element: AdminPatientDetail,
      }
    ],
  },
 {
  path:PATHS.ADMIN_PAYMENTS,
  element:AdminPayments,
  layout:"none",
  isPrivate:true,
  roles:["admin"],
 },

  // --- DOCTOR DASHBOARD ---
  // Layout chính cho tất cả các routes doctor
  {
    path: PATHS.DOCTOR_DASHBOARD,
    element: DoctorLayout, // Layout bọc ngoài với sidebar
    layout: "none",
    isPrivate: true,
    roles: ["doctor"],
    children: [
      // Trang chủ dashboard - index route
      {
        index: true, // Route mặc định khi vào /doctor-dashboard
        element: DoctorDashboard,
      },
      // Hồ sơ bác sĩ
      {
        path: PATHS.DOCTOR_PROFILE,
        element: DoctorProfile,
      },
      // Danh sách lịch hẹn
      {
        path: PATHS.DOCTOR_APPOINTMENTS,
        element: DoctorAppointments,
      },
      // Chi tiết lịch hẹn
      {
        path: PATHS.DOCTOR_APPOINTMENT_DETAIL,
        element: AppointmentDetail,
      },
      // Danh sách bệnh nhân
      {
        path: PATHS.DOCTOR_PATIENTS,
        element: DoctorPatients,
      },
    ],
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