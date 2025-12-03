import { Navigate } from 'react-router-dom';
import authService from '../api/authService';


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập nhưng không có quyền truy cập
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect về trang phù hợp với role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'patient':
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Có quyền truy cập
  return children;
};

export default ProtectedRoute;