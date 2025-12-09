import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Calendar, Phone, Mail, MapPin, Heart, FileText, Loader, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination'; 


const ITEMS_PER_PAGE = 3;


const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    fetchPatients();
  }, []);
  
  const fullFilteredPatients = useMemo(() => {
    let filtered = [...patients];
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.full_name?.toLowerCase().includes(lowercasedTerm) ||
        patient.phone?.includes(searchTerm) ||
        patient.user?.email?.toLowerCase().includes(lowercasedTerm)
      );
    }
    if (filterGender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }
    return filtered;
  }, [patients, searchTerm, filterGender]);
  
 
  const paginatedPatients = useMemo(() => {
    const newLastPage = Math.ceil(fullFilteredPatients.length / ITEMS_PER_PAGE);
    const finalLastPage = newLastPage > 0 ? newLastPage : 1;
    setLastPage(finalLastPage); 

    let actualCurrentPage = currentPage;
    // Nếu trang hiện tại lớn hơn trang cuối (xảy ra khi lọc), tự động nhảy về trang cuối
    if (currentPage > finalLastPage) {
        actualCurrentPage = finalLastPage;
        setCurrentPage(finalLastPage);
    }
    
    const startIndex = (actualCurrentPage - 1) * ITEMS_PER_PAGE;
    return fullFilteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [fullFilteredPatients, currentPage]);


  useEffect(() => {
    if(currentPage !== 1) {
      setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterGender]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/doctor/appointments');
      if (response.data.success) {
        const appointments = response.data.data || [];
        const uniquePatients = [];
        const patientIds = new Set();
        appointments.forEach(apt => {
          if (apt.patient && !patientIds.has(apt.patient.id)) {
            patientIds.add(apt.patient.id);
            uniquePatients.push({
              ...apt.patient,
              lastAppointment: apt.appointment_time,
              appointmentCount: appointments.filter(a => a.patient_id === apt.patient.id).length
            });
          }
        });
        uniquePatients.sort((a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment));
        setPatients(uniquePatients);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Không thể tải danh sách bệnh nhân";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= lastPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // --- PHẦN RENDER GIAO DIỆN --- //
  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader size={48} className="animate-spin text-blue-600" /><p className="ml-4">Đang tải...</p></div>;
  }

  if (error) {
    return <div className="text-center p-10"><AlertCircle size={64} className="text-red-500 mx-auto" /><p className="mt-4 text-xl">{error}</p><button onClick={fetchPatients} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">Thử lại</button></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users className="text-blue-600" />Danh sách bệnh nhân</h2>
            <p className="text-gray-500">Quản lý thông tin bệnh nhân đã từng khám</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{fullFilteredPatients.length}</p>
            <p className="text-sm text-gray-500">Bệnh nhân</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên, SĐT, email..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc giới tính</label>
            <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"><option value="all">Tất cả</option><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select>
          </div>
        </div>
      </div>

      {fullFilteredPatients.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPatients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white"><div className="flex items-center gap-3"><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">{patient.avatar_url ? (<img src={patient.avatar_url} alt={patient.full_name} className="w-full h-full rounded-full object-cover" />) : (patient.full_name?.charAt(0)?.toUpperCase() || 'P')}</div><div className="flex-1"><h3 className="font-bold text-lg truncate">{patient.full_name || 'N/A'}</h3><p className="text-sm text-blue-100">ID: #{patient.id}</p></div></div></div>
                 <div className="p-4 space-y-3 flex-grow"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} className="text-gray-400" /><span>{patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} tuổi (${new Date(patient.date_of_birth).toLocaleDateString('vi-VN')})` : 'Chưa cập nhật'}</span></div><div className="flex items-center gap-2 text-sm text-gray-600"><Users size={16} className="text-gray-400" /><span>{patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}</span></div><div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={16} className="text-gray-400" /><span>{patient.phone || 'Chưa cập nhật'}</span></div><div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={16} className="text-gray-400" /><span className="truncate">{patient.user?.email || 'Chưa cập nhật'}</span></div></div>
                 <div className="p-4 pt-0"><div className="pt-3 border-t grid grid-cols-2 gap-2 text-center mb-3"><div className="bg-blue-50 rounded-lg p-2"><p className="text-xs text-gray-600">Số lần khám</p><p className="text-lg font-bold text-blue-600">{patient.appointmentCount || 0}</p></div><div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-600">Lần gần nhất</p><p className="text-sm font-medium text-green-600">{patient.lastAppointment ? new Date(patient.lastAppointment).toLocaleDateString('vi-VN') : 'N/A'}</p></div></div><Link to={`/doctor-dashboard/patients/${patient.id}`} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all">Xem chi tiết <ChevronRight size={16} /></Link></div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={64} />
          <p className="text-gray-500 font-medium text-lg">{searchTerm || filterGender !== 'all' ? 'Không tìm thấy bệnh nhân phù hợp' : 'Chưa có bệnh nhân nào'}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;