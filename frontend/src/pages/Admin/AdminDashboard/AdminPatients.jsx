import React, { useState, useEffect, useMemo } from 'react'; // BƯỚC 1: Thêm 'useMemo' hook
import { Users, Search, Calendar, Phone, Mail, MapPin, Heart, FileText, Loader, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination'; // Đảm bảo import Pagination component

// =================================================================
// BƯỚC 2: Định nghĩa hằng số cho số lượng item trên mỗi trang
// Việc này giúp dễ dàng thay đổi cấu hình sau này
const ITEMS_PER_PAGE = 6;
// =================================================================

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]); // State lưu trữ danh sách bệnh nhân gốc từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho việc tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  // State cho việc phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Lấy dữ liệu lần đầu khi component được mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // =================================================================
  // BƯỚC 3: Sử dụng useMemo để tính toán danh sách đã được lọc một cách hiệu quả.
  // 'fullFilteredPatients' sẽ chứa TOÀN BỘ bệnh nhân khớp với điều kiện tìm kiếm/lọc (chưa phân trang).
  // Hook này chỉ chạy lại khi một trong các dependencies (patients, searchTerm, filterGender) thay đổi.
  const fullFilteredPatients = useMemo(() => {
    // Bắt đầu với danh sách gốc
    let filtered = [...patients];

    // Lọc theo từ khóa tìm kiếm (tên, sđt, email)
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.full_name?.toLowerCase().includes(lowercasedTerm) ||
        patient.phone?.includes(searchTerm) ||
        patient.user?.email?.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Lọc theo giới tính
    if (filterGender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filterGender);
    }
    
    return filtered;
  }, [patients, searchTerm, filterGender]);
  // =================================================================


  // =================================================================
  // BƯỚC 4: Tạo một useEffect riêng để xử lý logic phân trang.
  // Hook này sẽ chạy mỗi khi danh sách đã lọc ('fullFilteredPatients') hoặc trang hiện tại ('currentPage') thay đổi.
  // Nó sẽ tính toán và trả về danh sách bệnh nhân cho trang hiện tại.
  const paginatedPatients = useMemo(() => {
    // Tính toán tổng số trang cần thiết
    const newLastPage = Math.ceil(fullFilteredPatients.length / ITEMS_PER_PAGE);
    // Nếu không có kết quả nào, vẫn coi là có 1 trang
    setLastPage(newLastPage > 0 ? newLastPage : 1); 

    // Nếu trang hiện tại lớn hơn tổng số trang mới (xảy ra sau khi lọc),
    // tự động chuyển về trang cuối cùng có dữ liệu
    if (currentPage > newLastPage && newLastPage > 0) {
      setCurrentPage(newLastPage);
    }
    
    // Tính toán index bắt đầu và kết thúc để cắt mảng
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Trả về một "lát cắt" của danh sách, tương ứng với trang hiện tại
    return fullFilteredPatients.slice(startIndex, endIndex);

  }, [fullFilteredPatients, currentPage]);
  // =================================================================


  // =================================================================
  // BƯỚC 5: Khi người dùng thay đổi bộ lọc, tự động quay về trang 1
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, filterGender]);
  // =================================================================

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
        
        // Sắp xếp bệnh nhân theo lần khám gần nhất (mới nhất lên đầu)
        uniquePatients.sort((a, b) => new Date(b.lastAppointment) - new Date(a.lastAppointment));

        setPatients(uniquePatients);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải danh sách bệnh nhân";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  // =================================================================
  // BƯỚC 6: Tạo hàm callback để xử lý sự kiện thay đổi trang từ component Pagination
  const handlePageChange = (page) => {
    if (page > 0 && page <= lastPage) {
      setCurrentPage(page);
      // Tự động cuộn lên đầu trang để có trải nghiệm tốt hơn
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // =================================================================

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải danh sách bệnh nhân...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPatients}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Users className="text-blue-600" size={28} />
              Danh sách bệnh nhân
            </h2>
            <p className="text-gray-500">
              Quản lý thông tin bệnh nhân đã từng khám
            </p>
          </div>
          <div className="text-right">
            {/* BƯỚC 7: Hiển thị tổng số bệnh nhân đã được lọc, không phải số lượng trên trang hiện tại */}
            <p className="text-3xl font-bold text-blue-600">{fullFilteredPatients.length}</p>
            <p className="text-sm text-gray-500">Bệnh nhân</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search-patient" className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm bệnh nhân
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="search-patient"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên, số điện thoại, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender-filter" className="flex items-center text-sm font-medium text-gray-700 mb-2 gap-2">
              <Filter size={16} />
              Lọc theo giới tính
            </label>
            <select
              id="gender-filter"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid & Pagination */}
      {/* BƯỚC 8: Kiểm tra điều kiện dựa trên 'fullFilteredPatients' */}
      {fullFilteredPatients.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* BƯỚC 9: Render danh sách đã được cắt (phân trang) */}
            {paginatedPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Header Card */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {patient.avatar_url ? (
                        <img
                          src={patient.avatar_url}
                          alt={patient.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        patient.full_name?.charAt(0)?.toUpperCase() || 'P'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg truncate">{patient.full_name || 'N/A'}</h3>
                      <p className="text-sm text-blue-100">ID: #{patient.id}</p>
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="p-4 space-y-3 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {patient.date_of_birth
                        ? `${calculateAge(patient.date_of_birth)} tuổi (${new Date(patient.date_of_birth).toLocaleDateString('vi-VN')})`
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{patient.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{patient.user?.email || 'Chưa cập nhật'}</span>
                  </div>
                  {/* ... các thông tin khác ... */}
                </div>

                {/* Footer Card */}
                <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-center mb-3">
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Số lần khám</p>
                        <p className="text-lg font-bold text-blue-600">{patient.appointmentCount || 0}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Lần gần nhất</p>
                        <p className="text-sm font-medium text-green-600">
                          {patient.lastAppointment
                            ? new Date(patient.lastAppointment).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/doctor-dashboard/patients/${patient.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Xem chi tiết
                      <ChevronRight size={16} />
                    </Link>
                </div>

              </div>
            ))}
          </div>

          {/* ================================================================= */}
          {/* BƯỚC 10: Tích hợp component Pagination vào JSX */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={handlePageChange}
            />
          </div>
          {/* ================================================================= */}

        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Users className="mx-auto mb-3 text-gray-300" size={64} />
          <p className="text-gray-500 font-medium text-lg">
            {searchTerm || filterGender !== 'all'
              ? 'Không tìm thấy bệnh nhân phù hợp'
              : 'Chưa có bệnh nhân nào'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || filterGender !== 'all'
              ? 'Thử thay đổi điều kiện tìm kiếm'
              : 'Bệnh nhân sẽ xuất hiện sau khi bạn có lịch hẹn'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;