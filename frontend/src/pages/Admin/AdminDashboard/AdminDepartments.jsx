import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader,
  AlertCircle,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Users,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';
import Modal from '../../../components/modal/Modal';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDoctorsModalOpen, setIsDoctorsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentDoctors, setDepartmentDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    head_doctor_id: '',
    phone: '',
    location: '',
    is_active: true
  });

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Không thể tải danh sách khoa');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setSelectedDepartment(department);
      setFormData({
        name: department.name || '',
        description: department.description || '',
        head_doctor_id: department.head_doctor_id || '',
        phone: department.phone || '',
        location: department.location || '',
        is_active: department.is_active ?? true
      });
    } else {
      setSelectedDepartment(null);
      setFormData({
        name: '',
        description: '',
        head_doctor_id: '',
        phone: '',
        location: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        head_doctor_id: formData.head_doctor_id || null
      };

      if (selectedDepartment) {
        const response = await api.put(`/departments/${selectedDepartment.id}`, submitData);
        if (response.data.success) {
          toast.success('Cập nhật khoa thành công!');
          fetchDepartments();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/departments', submitData);
        if (response.data.success) {
          toast.success('Tạo khoa mới thành công!');
          fetchDepartments();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error saving department:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const response = await api.delete(`/departments/${selectedDepartment.id}`);
      if (response.data.success) {
        toast.success('Xóa khoa thành công!');
        fetchDepartments();
        setIsDeleteModalOpen(false);
        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      const errorMsg = error.response?.data?.message || 'Không thể xóa khoa';
      toast.error(errorMsg);
    }
  };

  const openDeleteModal = (department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleViewDoctors = (department) => {
    setSelectedDepartment(department);
    const deptDoctors = doctors.filter(doc => doc.department_id === department.id);
    setDepartmentDoctors(deptDoctors);
    setIsDoctorsModalOpen(true);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <Loader size={48} className="animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý khoa</h1>
            <p className="text-gray-500 text-sm mt-1">
              Quản lý thông tin các khoa và bác sĩ trong bệnh viện
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            Thêm khoa mới
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khoa hoặc vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Departments Grid */}
        {filteredDepartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepartments.map((dept) => {
              const doctorCount = doctors.filter(doc => doc.department_id === dept.id).length;
              
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {dept.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          dept.is_active 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {dept.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {dept.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-4">
                      {dept.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {dept.description}
                        </p>
                      )}
                      
                      {dept.head_doctor && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User size={16} className="text-blue-600" />
                          <span className="font-medium">Trưởng khoa:</span>
                          <span>{dept.head_doctor.full_name}</span>
                        </div>
                      )}

                      {dept.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-blue-600" />
                          <span>{dept.location}</span>
                        </div>
                      )}

                      {dept.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={16} className="text-blue-600" />
                          <span>{dept.phone}</span>
                        </div>
                      )}

                      {/* Doctor Count Badge */}
                      <div className="flex items-center gap-2 text-sm pt-2">
                        <Users size={16} className="text-purple-600" />
                        <span className="font-semibold text-purple-600">
                          {doctorCount} bác sĩ
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleViewDoctors(dept)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all"
                      >
                        <Eye size={16} />
                        Xem bác sĩ ({doctorCount})
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(dept)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(dept)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">Không tìm thấy khoa nào</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedDepartment ? 'Cập nhật thông tin khoa' : 'Thêm khoa mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khoa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VD: Khoa Nội"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mô tả về khoa..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trưởng khoa
            </label>
            <select
              name="head_doctor_id"
              value={formData.head_doctor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Chọn trưởng khoa --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vị trí
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Tầng 3"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Khoa đang hoạt động
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              {selectedDepartment ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xác nhận xóa khoa"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Bạn có chắc chắn muốn xóa khoa{' '}
              <span className="font-bold">{selectedDepartment?.name}</span>?
              <br />
              <span className="text-red-600">Lưu ý: Các bác sĩ thuộc khoa này sẽ bị xóa liên kết khoa.</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              Xóa khoa
            </button>
          </div>
        </div>
      </Modal>

      {/* Doctors List Modal */}
      <Modal
        isOpen={isDoctorsModalOpen}
        onClose={() => setIsDoctorsModalOpen(false)}
        title={`Danh sách bác sĩ - ${selectedDepartment?.name}`}
      >
        <div className="space-y-4">
          {departmentDoctors.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {departmentDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{doctor.full_name}</h4>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      <p className="text-xs text-gray-500">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/doctors/${doctor.id}`}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      to={`/admin/doctors/${doctor.id}`}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Chưa có bác sĩ nào trong khoa này</p>
              <Link
                to="/admin/doctors"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus size={18} />
                Thêm bác sĩ
              </Link>
            </div>
          )}

          {departmentDoctors.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <Link
                to="/admin/doctors"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                Quản lý tất cả bác sĩ
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminDepartments;