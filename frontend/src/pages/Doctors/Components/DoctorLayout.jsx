// DoctorLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DoctorSidenav from './DoctorSideNav';
import { Loader } from 'lucide-react';

const DoctorLayout = () => {
  const navigate = useNavigate();
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={48} className="animate-spin text-primary"/>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <DoctorSidenav 
        doctorName={doctorInfo.profile?.full_name} 
        handleLogout={handleLogout} 
      />

      <div className="flex-1 ml-64">
        <main className="p-8">
          {/* ✅ LUÔN LUÔN render Outlet, React Router sẽ tự động chọn component phù hợp */}
          <Outlet context={{ doctorInfo }} />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;