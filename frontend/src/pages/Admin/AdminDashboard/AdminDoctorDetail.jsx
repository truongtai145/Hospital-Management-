import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, 
  Award, Clock, DollarSign, Calendar, CheckCircle, XCircle,
  Loader, AlertCircle, Edit, Power
} from 'lucide-react';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const AdminDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDoctorDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/admin/doctors/${id}`);
      if (response.data.success) {
        setDoctor(response.data.data.doctor);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể tải thông tin bác sĩ';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await api.post(`/admin/doctors/${id}/toggle-availability`);
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchDoctorDetail();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !doctor) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <AlertCircle size={64} className="text-red-500" />
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy bác sĩ'}</p>
            <button 
              onClick={() => navigate('/admin/doctors')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/doctors')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleToggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  doctor.is_available
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Power size={18} />
                {doctor.is_available ? 'Tắt hoạt động' : 'Bật hoạt động'}
              </button>
              <button
                onClick={() => navigate(`/admin/doctors/${id}/edit`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Edit size={18} />
                Chỉnh sửa
              </button>
            </div>
          </div>

          {/* Doctor Header Info */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {doctor.avatar_url ? (
                <img 
                  src={doctor.avatar_url} 
                  alt={doctor.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                doctor.full_name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{doctor.full_name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  doctor.is_available 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {doctor.is_available ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-4">{doctor.specialization || 'Bác sĩ'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase size={18} className="text-gray-400" />
                  <span className="text-sm">{doctor.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm">{doctor.experience_years || 0} năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-sm">{doctor.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-sm">{doctor.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Calendar}
            label="Tổng lịch hẹn"
            value={stats?.total_appointments || 0}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            label="Đã hoàn thành"
            value={stats?.completed_appointments || 0}
            color="green"
          />
          <StatCard
            icon={XCircle}
            label="Đang chờ"
            value={stats?.pending_appointments || 0}
            color="yellow"
          />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Professional Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-blue-600" size={20} />
                Thông tin chuyên môn
              </h3>
              
              <div className="space-y-4">
                <InfoRow label="Chuyên khoa" value={doctor.specialization || 'Chưa cập nhật'} />
                <InfoRow label="Số chứng chỉ hành nghề" value={doctor.license_number || 'N/A'} />
                <InfoRow label="Số năm kinh nghiệm" value={`${doctor.experience_years || 0} năm`} />
                
                {doctor.education && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <GraduationCap size={16} />
                      Trình độ học vấn
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{doctor.education}</p>
                  </div>
                )}
                
                {doctor.biography && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Tiểu sử</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{doctor.biography}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                Thông tin khác
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phí khám</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {doctor.consultation_fee 
                      ? new Intl.NumberFormat('vi-VN').format(doctor.consultation_fee) + ' ₫'
                      : 'Chưa cập nhật'
                    }
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Khoa</p>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                    <Briefcase size={16} />
                    <span className="font-medium">{doctor.department?.name || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    doctor.is_available 
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    <Power size={16} />
                    <span className="font-medium">
                      {doctor.is_available ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-gray-700">
                    {new Date(doctor.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

export default AdminDoctorDetail;