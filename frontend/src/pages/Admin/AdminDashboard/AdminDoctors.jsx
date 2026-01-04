import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Power, Loader, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0 });
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [pagination, setPagination] = useState({ 
    current_page: 1, 
    last_page: 1, 
    total: 0,
    per_page: 3
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    department_id: '',
    specialization: '',
    license_number: '',
    education: '',
    experience_years: 0,
    biography: '',
    consultation_fee: 0,
    avatar_url: '',
    is_available: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, filterDepartment, filterAvailable, pagination.current_page]);

  useEffect(() => {
    fetchDepartments();
    fetchStatistics();
  }, []);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filterDepartment !== 'all' && { department_id: filterDepartment }),
        ...(filterAvailable !== 'all' && { is_available: filterAvailable }),
      });

      const response = await api.get(`/admin/doctors?${params}`);
      if (response.data.success) {
        const data = response.data.data;
        setDoctors(data.data || []);
        setPagination(prev => ({
          ...prev,
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        }));
      }
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Bạn đang gửi request quá nhanh, vui lòng đợi một chút');
      } else {
        toast.error(error.response?.data?.message || 'Không thể tải danh sách bác sĩ');
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filterDepartment, filterAvailable, pagination.current_page, pagination.per_page]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Fetch departments error:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/doctors/statistics/overview');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setValidationErrors({});
    
    try {
      console.log('📤 Submitting doctor data:', formData);
      
      const response = await api.post('/admin/doctors', formData);
      
      if (response.data.success) {
        toast.success('Thêm bác sĩ mới thành công!');
        setShowAddModal(false);
        resetForm();
        fetchDoctors();
        fetchStatistics();
      }
    } catch (error) {
      console.error('❌ Add doctor error:', error.response || error);
      
      if (error.response?.status === 422) {
        // Validation errors
        const errors = error.response.data.errors || {};
        setValidationErrors(errors);
        
        // Show first error in toast
        const firstError = Object.values(errors)[0];
        if (firstError && Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
        }
      } else {
        toast.error(error.response?.data?.message || 'Không thể thêm bác sĩ');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setValidationErrors({});
    
    try {
      // eslint-disable-next-line no-unused-vars
      const { email, password, ...updateData } = formData;
      
      console.log('📤 Updating doctor data:', updateData);
      
      const response = await api.put(`/admin/doctors/${selectedDoctor.id}`, updateData);
      
      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setShowEditModal(false);
        resetForm();
        fetchDoctors();
      }
    } catch (error) {
      console.error('❌ Update doctor error:', error.response || error);
      
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        setValidationErrors(errors);
        
        const firstError = Object.values(errors)[0];
        if (firstError && Array.isArray(firstError)) {
          toast.error(firstError[0]);
        } else {
          toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
        }
      } else {
        toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) return;
    
    try {
      const response = await api.delete(`/admin/doctors/${id}`);
      if (response.data.success) {
        toast.success('Đã xóa bác sĩ thành công!');
        fetchDoctors();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa bác sĩ');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const response = await api.post(`/admin/doctors/${id}/toggle-availability`);
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchDoctors();
        fetchStatistics();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      email: doctor.user?.email || '',
      password: '',
      full_name: doctor.full_name,
      phone: doctor.phone || '',
      department_id: doctor.department_id,
      specialization: doctor.specialization || '',
      license_number: doctor.license_number,
      education: doctor.education || '',
      experience_years: doctor.experience_years || 0,
      biography: doctor.biography || '',
      consultation_fee: doctor.consultation_fee || 0,
      avatar_url: doctor.avatar_url || '',
      is_available: doctor.is_available,
    });
    setValidationErrors({});
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      department_id: '',
      specialization: '',
      license_number: '',
      education: '',
      experience_years: 0,
      biography: '',
      consultation_fee: 0,
      avatar_url: '',
      is_available: true,
    });
    setSelectedDoctor(null);
    setValidationErrors({});
  };

  const goToPage = (page) => {
    setPagination(prev => {
      const safePage = Math.max(1, Math.min(prev.last_page, page));
      return { ...prev, current_page: safePage };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startItem = (pagination.current_page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  if (loading && doctors.length === 0) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý bác sĩ</h1>
            <p className="text-gray-500 text-sm mt-1">
              Hiển thị {startItem}-{endItem} trong tổng số {pagination.total} bác sĩ
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Thêm bác sĩ mới
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Tổng số bác sĩ" value={stats.total} color="blue" />
          <StatCard label="Đang hoạt động" value={stats.available} color="green" />
          <StatCard label="Không hoạt động" value={stats.unavailable} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bác sĩ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {loading && searchTerm !== debouncedSearchTerm && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />
              )}
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả khoa</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <select
              value={filterAvailable}
              onChange={(e) => setFilterAvailable(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Đang hoạt động</option>
              <option value="0">Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Không tìm thấy bác sĩ nào</p>
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{startItem}</span> đến
                <span className="font-semibold text-gray-900"> {endItem}</span> trong tổng số
                <span className="font-semibold text-gray-900"> {pagination.total}</span> bác sĩ
              </div>

              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={goToPage}
              />
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <DoctorFormModal
          title="Thêm bác sĩ mới"
          formData={formData}
          departments={departments}
          onChange={handleInputChange}
          onSubmit={handleAddDoctor}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          isEdit={false}
          validationErrors={validationErrors}
          submitting={submitting}
        />
      )}

      {showEditModal && (
        <DoctorFormModal
          title="Chỉnh sửa thông tin bác sĩ"
          formData={formData}
          departments={departments}
          onChange={handleInputChange}
          onSubmit={handleEditDoctor}
          onClose={() => { setShowEditModal(false); resetForm(); }}
          isEdit={true}
          validationErrors={validationErrors}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  );
};

const DoctorCard = ({ doctor, onEdit, onDelete, onToggleAvailability }) => (
  <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition overflow-hidden">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
          {doctor.avatar_url ? (
            <img src={doctor.avatar_url} alt={doctor.full_name} className="w-full h-full rounded-full object-cover" />
          ) : (
            doctor.full_name?.charAt(0)?.toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{doctor.full_name}</h3>
          <p className="text-sm text-blue-100">{doctor.specialization || 'Bác sĩ'}</p>
        </div>
      </div>
    </div>

    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Khoa:</span>
        <span className="font-medium text-gray-800">{doctor.department?.name || 'N/A'}</span>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Kinh nghiệm:</span>
        <span className="font-medium text-gray-800">{doctor.experience_years || 0} năm</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Phí khám:</span>
        <span className="font-medium text-gray-800">
          {doctor.consultation_fee ? new Intl.NumberFormat('vi-VN').format(doctor.consultation_fee) + ' ₫' : 'Chưa cập nhật'}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Trạng thái:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          doctor.is_available 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {doctor.is_available ? 'Hoạt động' : 'Không hoạt động'}
        </span>
      </div>

      <div className="pt-3 border-t flex gap-2">
        <Link
          to={`/admin/doctors/${doctor.id}`}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
        >
          <Eye size={16} />
          Chi tiết
        </Link>
        <button
          onClick={() => onEdit(doctor)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm"
        >
          <Edit size={16} />
          Sửa
        </button>
        <button
          onClick={() => onToggleAvailability(doctor.id)}
          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
          title="Bật/Tắt hoạt động"
        >
          <Power size={16} />
        </button>
        <button
          onClick={() => onDelete(doctor.id)}
          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          title="Xóa"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const DoctorFormModal = ({ title, formData, departments, onChange, onSubmit, onClose, isEdit, validationErrors, submitting }) => {
  const getFieldError = (fieldName) => {
    const error = validationErrors[fieldName];
    if (error && Array.isArray(error)) {
      return error[0];
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {!isEdit && (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('email') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('email') && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    required
                    minLength={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      getFieldError('password') ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {getFieldError('password')}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={onChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('full_name') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {getFieldError('full_name') && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('full_name')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('phone') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('phone')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoa <span className="text-red-500">*</span>
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={onChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('department_id') ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn khoa</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {getFieldError('department_id') && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('department_id')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={onChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số chứng chỉ hành nghề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={onChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('license_number') ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {getFieldError('license_number') && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {getFieldError('license_number')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số năm kinh nghiệm</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={onChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phí khám (VNĐ)</label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee}
                onChange={onChange}
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Trình độ học vấn</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={onChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử</label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={onChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Ảnh đại diện</label>
              <input
                type="url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={onChange}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={onChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
              </label>
            </div>
          </div>

          {/* Show general errors */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-red-800 mb-2">Vui lòng kiểm tra lại:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {Object.entries(validationErrors).map(([field, errors]) => (
                      <li key={field}>
                        {Array.isArray(errors) ? errors[0] : errors}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>{isEdit ? 'Cập nhật' : 'Thêm mới'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
  };

  return (
    <div className={`bg-white p-4 rounded-lg border-l-4 ${colors[color]} shadow-sm`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default AdminDoctors;