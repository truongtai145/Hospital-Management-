import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, 
  Award, Clock, DollarSign, Calendar, CheckCircle, XCircle,
  Loader, AlertCircle, Edit, Power, MapPin, FileText
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

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này? Hành động này không thể hoàn tác!')) return;

    try {
      const response = await api.delete(`/admin/doctors/${id}`);
      if (response.data.success) {
        toast.success('Đã xóa bác sĩ thành công!');
        navigate('/admin/doctors');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa bác sĩ');
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
        {/* Header with Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/admin/doctors')}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Quay lại danh sách</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleToggleAvailability}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                  doctor.is_available
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <Power size={18} />
                {doctor.is_available ? 'Tắt hoạt động' : 'Bật hoạt động'}
              </button>
              
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition font-medium"
              >
                <XCircle size={18} />
                Xóa bác sĩ
              </button>
            </div>
          </div>

          {/* Doctor Profile Header */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg">
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
              
              <p className="text-lg text-blue-600 font-semibold mb-4">
                {doctor.specialization || 'Bác sĩ'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={Briefcase} label="Khoa" value={doctor.department?.name || 'N/A'} />
                <InfoItem icon={Award} label="Giấy phép hành nghề" value={doctor.license_number || 'N/A'} />
                <InfoItem icon={Clock} label="Kinh nghiệm" value={`${doctor.experience_years || 0} năm`} />
                <InfoItem icon={DollarSign} label="Phí khám" value={doctor.consultation_fee ? `${new Intl.NumberFormat('vi-VN').format(doctor.consultation_fee)} ₫` : 'Chưa cập nhật'} />
                <InfoItem icon={Mail} label="Email" value={doctor.user?.email || 'N/A'} />
                <InfoItem icon={Phone} label="Số điện thoại" value={doctor.phone || 'Chưa cập nhật'} />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={Calendar}
            label="Tổng lịch hẹn"
            value={stats?.total_appointments || 0}
            color="blue"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Đã hoàn thành"
            value={stats?.completed_appointments || 0}
            color="green"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            icon={Clock}
            label="Đang chờ"
            value={stats?.pending_appointments || 0}
            color="yellow"
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Professional Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-blue-600" size={20} />
                Thông tin chuyên môn
              </h3>
              
              <div className="space-y-4">
                <DetailRow label="Chuyên khoa" value={doctor.specialization || 'Chưa cập nhật'} />
                <DetailRow label="Số chứng chỉ hành nghề" value={doctor.license_number || 'N/A'} />
                <DetailRow label="Số năm kinh nghiệm" value={`${doctor.experience_years || 0} năm`} />
                <DetailRow label="Khoa làm việc" value={doctor.department?.name || 'N/A'} />
                
                {doctor.education && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <GraduationCap size={16} className="text-gray-400" />
                      Trình độ học vấn
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-gray-700 whitespace-pre-line">{doctor.education}</p>
                    </div>
                  </div>
                )}
                
                {doctor.biography && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      Tiểu sử
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">{doctor.biography}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            {/* Financial Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                Thông tin phí khám
              </h3>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 text-center">
                <p className="text-sm text-gray-600 mb-1">Phí khám bệnh</p>
                <p className="text-3xl font-bold text-green-600">
                  {doctor.consultation_fee 
                    ? new Intl.NumberFormat('vi-VN').format(doctor.consultation_fee) + ' ₫'
                    : 'Chưa cập nhật'
                  }
                </p>
              </div>
            </div>

            {/* Status & Department */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Trạng thái & Khoa</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Trạng thái hoạt động</p>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    doctor.is_available 
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}>
                    <Power size={16} />
                    <span className="font-medium">
                      {doctor.is_available ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Khoa phụ trách</p>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
                    <Briefcase size={16} />
                    <span className="font-medium">{doctor.department?.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Ngày tạo tài khoản</p>
                  <p className="text-gray-700 font-medium">
                    {new Date(doctor.created_at).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {doctor.updated_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cập nhật lần cuối</p>
                    <p className="text-gray-700">
                      {new Date(doctor.updated_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper Components
// eslint-disable-next-line no-unused-vars
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
      <Icon size={18} className="text-gray-600" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, bgColor, textColor }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon size={24} className={textColor} />
      </div>
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-800 font-semibold">{value}</span>
  </div>
);

export default AdminDoctorDetail;