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
  ADMIN: "/admin",
  DOCTOR_DASHBOARD: "/doctor-dashboard",
  PATIENT_DASHBOARD: "/patient-dashboard",
  DOCTOR_PROFILE: "/doctor-dashboard/profile",
  DOCTOR_PATIENTS: "/doctor-dashboard/patients",
  DOCTOR_PATIENT_DETAIL: "/doctor-dashboard/patients/:id",
  DOCTOR_APPOINTMENTS: "/doctor-dashboard/appointments",
  DOCTOR_APPOINTMENT_DETAIL: "/doctor-dashboard/appointments/:id",

  // --- SYSTEM ---
  NOT_FOUND: "*",
};
