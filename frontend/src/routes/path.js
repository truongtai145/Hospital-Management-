export const PATHS = {
  // --- PUBLIC ---
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  SERVICES: "/services",
  DOCTORS: "/doctors",
  NEWS: "/news",
  NEWS_DETAIL: "/news/:id", // Thêm cái này cho trang chi tiết tin tức
  CONTACT: "/contact",
  
  // --- DASHBOARD ROLES ---
  ADMIN: "/admin",
  DOCTOR_DASHBOARD: "/doctor-dashboard",   // Đổi tên khác đi để tránh nhầm với trang danh sách bác sĩ
  PATIENT_DASHBOARD: "/patient-dashboard",
  
  // --- SYSTEM ---
  NOT_FOUND: "*",
};