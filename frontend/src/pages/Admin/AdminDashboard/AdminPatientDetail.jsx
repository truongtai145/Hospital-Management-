import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, Heart, FileText,
  Activity, Clock, Loader, AlertCircle, CreditCard, Edit, Trash2,
  Ban, CheckCircle, X, Save
} from "lucide-react";
import AdminLayout from "../Components/AdminLayout";
import { api } from "../../../api/axios";
import { toast } from "react-toastify";

const AdminPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: '',
    insurance_number: '',
    allergies: '',
    medical_history: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (id) {
      fetchPatientDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPatientDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/admin/patients/${id}`);
      if (response.data.success) {
        const patientData = response.data.data.patient;
        setPatient(patientData);
        setAppointments(response.data.data.appointments || []);
        setStats(response.data.data.stats);
        
        setEditForm({
          full_name: patientData.full_name || '',
          phone: patientData.phone || '',
          address: patientData.address || '',
          date_of_birth: patientData.date_of_birth || '',
          gender: patientData.gender || 'male',
          insurance_number: patientData.insurance_number || '',
          allergies: patientData.allergies || '',
          medical_history: patientData.medical_history || '',
          avatar_url: patientData.avatar_url || ''
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải thông tin bệnh nhân";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/admin/patients/${id}`, editForm);
      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setPatient(response.data.data);
        setIsEditing(false);
        fetchPatientDetail();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (patient) {
      setEditForm({
        full_name: patient.full_name || '',
        phone: patient.phone || '',
        address: patient.address || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'male',
        insurance_number: patient.insurance_number || '',
        allergies: patient.allergies || '',
        medical_history: patient.medical_history || '',
        avatar_url: patient.avatar_url || ''
      });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bệnh nhân này? Hành động này không thể hoàn tác!")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/patients/${id}`);
      if (response.data.success) {
        toast.success("Đã xóa bệnh nhân thành công!");
        navigate("/admin/patients");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa bệnh nhân");
    }
  };

  const handleToggleBlock = async () => {
    const action = patient.is_blocked ? "mở chặn" : "chặn";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} bệnh nhân này?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/patients/${id}/toggle-block`);
      if (response.data.success) {
        toast.success(response.data.message);
        setPatient(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Không thể ${action} bệnh nhân`);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
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
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !patient) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <AlertCircle size={64} className="text-red-500" />
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-600 mb-4">{error || "Không tìm thấy bệnh nhân"}</p>
            <button
              onClick={() => navigate("/admin/patients")}
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
        {/* Header Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/admin/patients")}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Quay lại danh sách</span>
            </button>

            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit size={18} />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleToggleBlock}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      patient.is_blocked
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    }`}
                  >
                    {patient.is_blocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                    {patient.is_blocked ? 'Mở chặn' : 'Chặn'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 size={18} />
                    Xóa
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                  >
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    Lưu
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    <X size={18} />
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Patient Header */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0 relative">
              {patient.avatar_url ? (
                <img
                  src={patient.avatar_url}
                  alt={patient.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={48} />
              )}
              {patient.is_blocked && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2">
                  <Ban size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{patient.full_name}</h1>
                {patient.is_blocked && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    Đã chặn
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">Bệnh nhân ID: #{patient.id}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem icon={Calendar} label="Tuổi" value={patient.date_of_birth ? `${calculateAge(patient.date_of_birth)} tuổi` : "Chưa cập nhật"} />
                <InfoItem icon={User} label="Giới tính" value={patient.gender === "male" ? "Nam" : patient.gender === "female" ? "Nữ" : "Khác"} />
                <InfoItem icon={Mail} label="Email" value={patient.user?.email || "N/A"} />
                <InfoItem icon={Phone} label="SĐT" value={patient.phone || "Chưa cập nhật"} />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Activity} label="Tổng lượt khám" value={stats?.total_appointments || 0} color="blue" />
          <StatCard icon={FileText} label="Đã hoàn thành" value={stats?.completed || 0} color="green" />
          <StatCard icon={Clock} label="Sắp tới" value={stats?.upcoming || 0} color="yellow" />
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Thông tin cá nhân
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số BHYT</label>
                    <input
                      type="text"
                      name="insurance_number"
                      value={editForm.insurance_number}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <InfoRow label="Họ và tên" value={patient.full_name} />
                  <InfoRow label="Ngày sinh" value={patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString("vi-VN") : "Chưa cập nhật"} />
                  <InfoRow label="Giới tính" value={patient.gender === "male" ? "Nam" : patient.gender === "female" ? "Nữ" : "Khác"} />
                  <InfoRow label="Số điện thoại" value={patient.phone || "Chưa cập nhật"} />
                  <InfoRow label="Email" value={patient.user?.email || "N/A"} />

                  {patient.address && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <MapPin size={16} />
                        Địa chỉ
                      </p>
                      <p className="text-gray-700 text-sm">{patient.address}</p>
                    </div>
                  )}

                  {patient.insurance_number && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <CreditCard size={16} />
                        Số BHYT
                      </p>
                      <p className="text-gray-700 font-mono bg-green-50 px-3 py-2 rounded-lg text-sm">
                        {patient.insurance_number}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Medical Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="text-red-600" size={20} />
                Thông tin y tế
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dị ứng</label>
                    <textarea
                      name="allergies"
                      value={editForm.allergies}
                      onChange={handleEditChange}
                      rows="3"
                      placeholder="Nhập thông tin dị ứng..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền sử bệnh</label>
                    <textarea
                      name="medical_history"
                      value={editForm.medical_history}
                      onChange={handleEditChange}
                      rows="3"
                      placeholder="Nhập tiền sử bệnh..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {patient.allergies ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" />
                        Dị ứng
                      </p>
                      <p className="text-gray-700 bg-red-50 p-3 rounded-lg text-sm border border-red-200">
                        {patient.allergies}
                      </p>
                    </div>
                  ) : null}

                  {patient.medical_history ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        <FileText size={16} />
                        Tiền sử bệnh
                      </p>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm border border-blue-200">
                        {patient.medical_history}
                      </p>
                    </div>
                  ) : null}

                  {!patient.allergies && !patient.medical_history && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Chưa có thông tin y tế
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Appointment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Lịch sử khám bệnh ({appointments.length})
              </h3>

              {appointments.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {appointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-gray-500">Chưa có lịch sử khám bệnh</p>
                </div>
              )}
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
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-100 text-green-600 border-green-200",
    yellow: "bg-yellow-100 text-yellow-600 border-yellow-200",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
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

const AppointmentCard = ({ appointment }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã khám",
    cancelled: "Đã hủy",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition hover:border-blue-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">
            {new Date(appointment.appointment_time).toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(appointment.appointment_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[appointment.status]}`}>
          {statusLabels[appointment.status]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-gray-400" />
          <span>BS. {appointment.doctor?.full_name || "N/A"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText size={16} className="text-gray-400" />
          <span>{appointment.department?.name || "N/A"}</span>
        </div>

        {appointment.reason && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Lý do khám:</p>
            <p className="text-sm text-gray-700">{appointment.reason}</p>
          </div>
        )}

        {appointment.doctor_notes && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Ghi chú của bác sĩ:</p>
            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
              {appointment.doctor_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPatientDetail;


