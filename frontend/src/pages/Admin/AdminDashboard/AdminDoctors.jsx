import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Power, Loader, AlertCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

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
    fetchDoctors();
    fetchDepartments();
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterDepartment, filterAvailable, pagination.current_page]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: 15,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment !== 'all' && { department_id: filterDepartment }),
        ...(filterAvailable !== 'all' && { is_available: filterAvailable }),
      });

      const response = await api.get(`/admin/doctors?${params}`);
      if (response.data.success) {
        const data = response.data.data;
        setDoctors(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách bác sĩ');
    } finally {
      setLoading(false);
    }
  };

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
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/admin/doctors', formData);
      if (response.data.success) {
        toast.success('Thêm bác sĩ mới thành công!');
        setShowAddModal(false);
        resetForm();
        fetchDoctors();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm bác sĩ');
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line no-unused-vars
      const { email, password, ...updateData } = formData;
      const response = await api.put(`/admin/doctors/${selectedDoctor.id}`, updateData);
      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setShowEditModal(false);
        resetForm();
        fetchDoctors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
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
  };

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
            <p className="text-gray-500 text-sm mt-1">Thêm mới và quản lý thông tin bác sĩ</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
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

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              disabled={pagination.current_page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              Trang {pagination.current_page} / {pagination.last_page}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              disabled={pagination.current_page === pagination.last_page}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <DoctorFormModal
          title="Thêm bác sĩ mới"
          formData={formData}
          departments={departments}
          onChange={handleInputChange}
          onSubmit={handleAddDoctor}
          onClose={() => { setShowAddModal(false); resetForm(); }}
          isEdit={false}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <DoctorFormModal
          title="Chỉnh sửa thông tin bác sĩ"
          formData={formData}
          departments={departments}
          onChange={handleInputChange}
          onSubmit={handleEditDoctor}
          onClose={() => { setShowEditModal(false); resetForm(); }}
          isEdit={true}
        />
      )}
    </AdminLayout>
  );
};

// Doctor Card Component
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

// Form Modal Component
const DoctorFormModal = ({ title, formData, departments, onChange, onSubmit, onClose, isEdit }) => (
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn khoa</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

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