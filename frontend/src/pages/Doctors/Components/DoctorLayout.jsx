// src/components/Layout/DoctorLayout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import DoctorSidenav from'./DoctorSideNav';
import DoctorDashboard from '../DoctorDashboard/DoctorDashboard';
import { Loader } from 'lucide-react';

const DoctorLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctorInfo, setDoctorInfo] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'doctor') {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate('/login');
    } else {
      setDoctorInfo(storedUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Đăng xuất thành công!");
    navigate('/login');
  };
  
  if (!doctorInfo) {
    return <div className="flex justify-center items-center h-screen"><Loader size={48} className="animate-spin text-primary"/></div>;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidenav (Sidebar) */}
      <DoctorSidenav 
        doctorName={doctorInfo.profile?.full_name} 
        handleLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Header (nếu có, ví dụ: thanh tìm kiếm, thông báo) */}
        {/* <div className="p-4 bg-white border-b">Header Content</div> */}

        <main className="p-8">
          {/* Render DoctorDashboard mặc định khi ở /doctor-dashboard, hoặc <Outlet /> cho nested routes */}
          {location.pathname === '/doctor-dashboard' ? (
            <DoctorDashboard doctorInfo={doctorInfo} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;