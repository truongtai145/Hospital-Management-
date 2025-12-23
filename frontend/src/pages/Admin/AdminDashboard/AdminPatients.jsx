import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Trash2, User, Phone, Calendar, Heart, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    with_insurance: 0,
    new_this_month: 0
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 3
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch patients với debounced search term
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterGender, pagination.current_page]);

  // Fetch statistics chỉ 1 lần khi mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterGender !== 'all' && { gender: filterGender }),
      });

      const response = await api.get(`/admin/patients?${params}`);
      if (response.data.success) {
        const data = response.data.data;
        setPatients(data.data || []);
        setPagination(prev => ({
          ...prev,
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        }));
      }
    } catch (error) {
      console.error('Fetch patients error:', error);
      if (error.response?.status === 429) {
        toast.error('Bạn đang gửi request quá nhanh, vui lòng đợi một chút');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(error.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterGender, pagination.current_page, pagination.per_page]);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/patients/statistics/overview');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
      if (error.response?.status !== 429) {
        toast.error('Không thể tải thống kê');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) return;
    
    try {
      const response = await api.delete(`/admin/patients/${id}`);
      if (response.data.success) {
        toast.success('Đã xóa bệnh nhân thành công!');
        fetchPatients();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa bệnh nhân');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => {
      const safePage = Math.max(1, Math.min(prev.last_page, newPage));
      return { ...prev, current_page: safePage };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const startItem = (pagination.current_page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  if (loading && patients.length === 0) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải danh sách...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý bệnh nhân</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hiển thị {startItem}-{endItem} trong tổng số {pagination.total} bệnh nhân
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Tổng số" value={stats.total} color="blue" />
          <StatCard label="Nam" value={stats.male} color="blue" />
          <StatCard label="Nữ" value={stats.female} color="pink" />
          <StatCard label="Có BHYT" value={stats.with_insurance} color="green" />
          <StatCard label="Mới tháng này" value={stats.new_this_month} color="purple" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bệnh nhân..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {loading && searchTerm !== debouncedSearchTerm && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />
              )}
            </div>

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Tất cả giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        {/* Patients Grid */}
        {patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                calculateAge={calculateAge}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <User className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500 text-lg mb-2">Không tìm thấy bệnh nhân nào</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || filterGender !== 'all' 
                ? 'Thử thay đổi bộ lọc để xem kết quả khác' 
                : 'Chưa có bệnh nhân nào trong hệ thống'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-gray-900">{startItem}</span> đến
              <span className="font-semibold text-gray-900"> {endItem}</span> trong tổng số
              <span className="font-semibold text-gray-900"> {pagination.total}</span> bệnh nhân
            </div>

            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const PatientCard = ({ patient, calculateAge, onDelete }) => (
  <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden">
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {patient.avatar_url ? (
            <img 
              src={patient.avatar_url} 
              alt={patient.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User size={32} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{patient.full_name}</h3>
          <p className="text-sm text-purple-100">ID: #{patient.id}</p>
        </div>
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Calendar size={16} className="text-gray-400" />
        <span>
          {patient.date_of_birth 
            ? `${calculateAge(patient.date_of_birth)} tuổi`
            : 'Chưa cập nhật tuổi'
          }
        </span>
        <span className="mx-2">•</span>
        <span>{patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Phone size={16} className="text-gray-400" />
        <span>{patient.phone || 'Chưa cập nhật'}</span>
      </div>

      {patient.insurance_number && (
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
            Có BHYT
          </span>
          <span className="text-gray-600 text-xs truncate">{patient.insurance_number}</span>
        </div>
      )}

      {patient.allergies && (
        <div className="flex items-start gap-2 text-sm">
          <Heart size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-700">Dị ứng:</p>
            <p className="text-gray-600 text-xs line-clamp-2">{patient.allergies}</p>
          </div>
        </div>
      )}

      <div className="pt-3 border-t flex gap-2">
        <Link
          to={`/admin/patients/${patient.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
        >
          <Eye size={16} />
          Chi tiết
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(patient.id);
          }}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'border-blue-500',
    pink: 'border-pink-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
  };

  return (
    <div className={`bg-white p-4 rounded-lg border-l-4 ${colors[color]} shadow-sm`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default AdminPatients;