import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/axios'; // Đảm bảo đường dẫn này đúng
import { toast } from 'react-toastify';
import { Loader, AlertCircle, Linkedin, Facebook, Instagram } from 'lucide-react';
import Banner from '../../components/Banner/Banner'; // Import Banner nếu bạn có

// --- Component DoctorCard (Giữ nguyên) ---
// eslint-disable-next-line no-unused-vars
const DoctorCard = ({ id, img, name, role, department }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden group flex flex-col">
    {/* ... (JSX của DoctorCard giữ nguyên) ... */}
    <Link 
        to={`/doctors/${id}`} 
        className="block mt-auto bg-primary text-white ...">
        Xem hồ sơ
    </Link>
  </div>
);

// --- Component Trang Bác sĩ chính ---
const DoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/doctors');
        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          throw new Error("Không thể lấy dữ liệu bác sĩ.");
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách bác sĩ.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Hàm render nội dung chính
  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-[500px] flex justify-center items-center">
          <Loader size={48} className="animate-spin text-primary" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="py-20 text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <h3 className="text-xl font-bold">Có lỗi xảy ra</h3>
          <p className="mt-2">{error}</p>
        </div>
      );
    }
    if (doctors.length === 0) {
      return <div className="text-center text-gray-500 py-20">Chưa có thông tin bác sĩ nào.</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map(doctor => (
          <DoctorCard 
            key={doctor.id}
            id={doctor.id}
            img={doctor.avatar_url}
            name={doctor.full_name}
            department={doctor.department?.name}
            role={doctor.specialization}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Sử dụng Banner chung hoặc tạo một banner riêng */}
      <Banner title="Đội ngũ Bác sĩ" breadcrumb="Trang chủ / Bác sĩ" />

      <section className="py-20">
        <div className="container mx-auto px-4 text-center mb-16">
          <p className="text-secondary font-bold uppercase tracking-widest text-sm">Chăm sóc tin cậy</p>
          <h2 className="text-5xl font-serif text-primary mt-2">Gặp gỡ các Chuyên gia của chúng tôi</h2>
        </div>
        <div className="container mx-auto px-4">
          {renderContent()}
        </div>
      </section>
      
    </div>
  );
};

export default DoctorPage;