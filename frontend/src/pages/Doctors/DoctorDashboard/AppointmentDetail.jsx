import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, Heart, FileText, 
  ArrowLeft, Save, Loader, AlertCircle, CheckCircle, XCircle,
  Pill, ClipboardList
} from 'lucide-react';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
    completed: "bg-green-100 text-green-700 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
    no_show: "bg-gray-100 text-gray-700 border border-gray-300",
  };
  
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã khám",
    cancelled: "Đã hủy",
    no_show: "Vắng mặt",
  };
  
  return (
    <span className={`text-sm font-semibold px-4 py-2 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    doctor_notes: '',
    prescription: '',
  });

  useEffect(() => {
    fetchAppointmentDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAppointmentDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/appointments/${id}`);
      
      if (response.data.success) {
        const apt = response.data.data;
        setAppointment(apt);
        setFormData({
          status: apt.status || 'pending',
          doctor_notes: apt.doctor_notes || '',
          prescription: apt.prescription || '',
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải chi tiết lịch hẹn";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await api.put(`/appointments/${id}`, formData);
      
      if (response.data.success) {
        setAppointment(response.data.data);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể cập nhật thông tin";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    setSaving(true);
    try {
      const response = await api.put(`/appointments/${id}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setAppointment(response.data.data);
        setFormData(prev => ({ ...prev, status: newStatus }));
        toast.success('Cập nhật trạng thái thành công!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-4">{error || 'Không tìm thấy lịch hẹn'}</p>
          <button 
            onClick={() => navigate('/doctor-dashboard/appointments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const patient = appointment.patient;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/doctor-dashboard/appointments')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <StatusBadge status={appointment.status} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {patient?.full_name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết lịch hẹn #{appointment.id}
            </h2>
            <p className="text-gray-500">
              {new Date(appointment.appointment_time).toLocaleString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {appointment.status === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Hành động nhanh</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleQuickStatusUpdate('confirmed')}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Xác nhận lịch hẹn
            </button>
            <button
              onClick={() => handleQuickStatusUpdate('cancelled')}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
            >
              <XCircle size={20} />
              Hủy lịch hẹn
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Thông tin bệnh nhân
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="font-medium text-gray-800">{patient?.full_name || 'N/A'}</p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{patient?.phone || 'Chưa cập nhật'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{patient?.user?.email || 'Chưa cập nhật'}</span>
              </div>
              
              {patient?.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ngày sinh:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {patient?.date_of_birth 
                      ? new Date(patient.date_of_birth).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Giới tính:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {patient?.gender === 'male' ? 'Nam' : patient?.gender === 'female' ? 'Nữ' : 'Khác'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart size={20} className="text-red-600" />
              Thông tin y tế
            </h3>
            
            <div className="space-y-4">
              {patient?.allergies && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Dị ứng
                  </p>
                  <p className="text-sm text-gray-800 bg-red-50 p-3 rounded-lg border border-red-200">
                    {patient.allergies}
                  </p>
                </div>
              )}
              
              {patient?.medical_history && (
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <FileText size={14} />
                    Tiền sử bệnh
                  </p>
                  <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    {patient.medical_history}
                  </p>
                </div>
              )}
              
              {!patient?.allergies && !patient?.medical_history && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Chưa có thông tin y tế
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details & Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Chi tiết lịch hẹn
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Calendar size={16} />
                  Ngày khám
                </p>
                <p className="font-semibold text-gray-800">
                  {new Date(appointment.appointment_time).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Clock size={16} />
                  Giờ khám
                </p>
                <p className="font-semibold text-gray-800">
                  {new Date(appointment.appointment_time).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="md:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <ClipboardList size={16} />
                  Lý do khám
                </p>
                <p className="text-gray-800">{appointment.reason}</p>
              </div>
            </div>
          </div>

          {/* Medical Notes Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Ghi chú khám bệnh
            </h3>
            
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái lịch hẹn
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                  <option value="no_show">Vắng mặt</option>
                </select>
              </div>

              {/* Doctor Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                  <FileText size={16} />
                  Ghi chú của bác sĩ
                </label>
                <textarea
                  name="doctor_notes"
                  value={formData.doctor_notes}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Ghi chú về tình trạng bệnh nhân, chẩn đoán, các xét nghiệm cần thiết..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Prescription */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                  <Pill size={16} />
                  Đơn thuốc
                </label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tên thuốc, liều lượng, cách dùng, thời gian sử dụng..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Lưu thông tin
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;