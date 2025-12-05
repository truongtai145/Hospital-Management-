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
  APPOINTMENT :"/appointment",

  // --- DASHBOARD ROLES ---
  ADMIN: "/admin",
  DOCTOR_DASHBOARD: "/doctor-dashboard",  
  PATIENT_DASHBOARD: "/patient-dashboard",
  
  // --- SYSTEM ---
  NOT_FOUND: "*",
};