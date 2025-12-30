import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, 
  Heart, FileText, Loader, AlertCircle, Users,
  Clock, CheckCircle, XCircle, AlertTriangle,
  Activity, Shield
} from 'lucide-react';
import DoctorLayout from '../Components/DoctorLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const DoctorPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatientDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPatientDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
     
      const response = await api.get(`/doctor/patients/${id}`);
      
      if (response.data.success) {
        setPatient(response.data.data.patient);
        setAppointments(response.data.data.appointments);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể tải thông tin bệnh nhân';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </DoctorLayout>
    );
  }

  if (error || !patient) {
    return (
      <DoctorLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <AlertCircle size={64} className="text-red-500" />
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy bệnh nhân'}</p>
            <button 
              onClick={() => navigate('/doctor-dashboard/patients')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => navigate('/doctor-dashboard/patients')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại danh sách</span>
          </button>

          {/* Patient Profile Header */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-lg">
              {patient.avatar_url ? (
                <img 
                  src={patient.avatar_url} 
                  alt={patient.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                patient.full_name?.charAt(0)?.toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{patient.full_name}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                  ID: #{patient.id}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <InfoItem 
                  icon={Calendar} 
                  label="Tuổi" 
                  value={patient.date_of_birth 
                    ? `${calculateAge(patient.date_of_birth)} tuổi (${new Date(patient.date_of_birth).toLocaleDateString('vi-VN')})`
                    : 'Chưa cập nhật'
                  } 
                />
                <InfoItem 
                  icon={Users} 
                  label="Giới tính" 
                  value={patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'} 
                />
                <InfoItem icon={Phone} label="Số điện thoại" value={patient.phone || 'Chưa cập nhật'} />
                <InfoItem icon={Mail} label="Email" value={patient.user?.email || 'Chưa cập nhật'} />
                {patient.address && (
                  <div className="md:col-span-2">
                    <InfoItem icon={MapPin} label="Địa chỉ" value={patient.address} />
                  </div>
                )}
                {patient.insurance_number && (
                  <InfoItem icon={Shield} label="Số BHYT" value={patient.insurance_number} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={Calendar}
            label="Tổng lịch hẹn"
            value={stats?.total_appointments || 0}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Đã hoàn thành"
            value={stats?.completed || 0}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <StatCard
            icon={Clock}
            label="Sắp tới"
            value={stats?.upcoming || 0}
            bgColor="bg-yellow-50"
            textColor="text-yellow-600"
          />
          <StatCard
            icon={XCircle}
            label="Đã hủy"
            value={stats?.cancelled || 0}
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
        </div>

        {/* Medical Information & Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical History */}
          <div className="lg:col-span-1 space-y-6">
            {/* Allergies */}
            {patient.allergies && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-600" size={20} />
                  Dị ứng
                </h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-gray-700 whitespace-pre-line">{patient.allergies}</p>
                </div>
              </div>
            )}

            {/* Medical History */}
            {patient.medical_history && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Tiền sử bệnh
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-line">{patient.medical_history}</p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin khác</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đăng ký</p>
                  <p className="text-gray-700 font-medium">
                    {new Date(patient.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="text-blue-600" size={20} />
                Lịch sử khám bệnh ({appointments.length})
              </h3>
              
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span className="font-semibold text-gray-800">
                              {new Date(appointment.appointment_time).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} className="text-gray-400" />
                            <span>
                              {new Date(appointment.appointment_time).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>

                      {appointment.symptoms && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600 mb-1">Triệu chứng:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {appointment.symptoms}
                          </p>
                        </div>
                      )}

                      {appointment.diagnosis && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600 mb-1">Chẩn đoán:</p>
                          <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                            {appointment.diagnosis}
                          </p>
                        </div>
                      )}

                      {appointment.treatment && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600 mb-1">Điều trị:</p>
                          <p className="text-sm text-gray-700 bg-green-50 p-2 rounded border border-green-200">
                            {appointment.treatment}
                          </p>
                        </div>
                      )}

                      {appointment.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Ghi chú:</p>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                            {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500">Chưa có lịch hẹn nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
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

export default DoctorPatientDetail;