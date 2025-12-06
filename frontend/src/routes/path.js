import DoctorProfile from "../pages/Doctors/DoctorDashboard/DoctorProfile";
import PatientProfile from "../pages/Patient/PatientProfile";

export const PATHS = {
  // --- PUBLIC ---
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  SERVICES: "/services",
  DOCTORS: "/doctors",
  NEWS: "/news",
  NEWS_DETAIL: "/news/:id",
  CONTACT: "/contact",
  PATIENT_PROFILE: "/patient",
  PATIENT_APPOINTMENT_HISTORY: "/patient/history",
  APPOINTMENT: "/appointment",

  // --- DASHBOARD ROLES ---

  DOCTOR_DASHBOARD: "/doctor-dashboard",
  PATIENT_DASHBOARD: "/patient-dashboard",
  DOCTOR_PROFILE: "/doctor-dashboard/profile",
  DOCTOR_PATIENTS: "/doctor-dashboard/patients",
  DOCTOR_PATIENT_DETAIL: "/doctor-dashboard/patients/:id",
  DOCTOR_APPOINTMENTS: "/doctor-dashboard/appointments",
  DOCTOR_APPOINTMENT_DETAIL: "/doctor-dashboard/appointments/:id",
  ADMIN: "/admin",
  ADMIN_APPOINTMENTS: "/admin/appointments",
  ADMIN_DOCTORS: "/admin/doctors",
  ADMIN_DOCTOR_DETAIL: "/admin/doctors/:id",
  ADMIN_PATIENTS: "/admin/patients",
  ADMIN_PATIENT_DETAIL: "/admin/patients/:id",
  // --- SYSTEM ---
  NOT_FOUND: "*",
};
