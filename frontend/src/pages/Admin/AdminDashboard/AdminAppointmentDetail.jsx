import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Phone, Mail, FileText, Loader, AlertCircle } from 'lucide-react';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const AdminAppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAppointmentDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/appointments/${id}`);
      if (response.data.success) {
        setAppointment(response.data.data);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Không thể tải chi tiết lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <Loader size={48} className="animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!appointment) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <p className="text-xl">Không tìm thấy lịch hẹn</p>
          <button 
            onClick={() => navigate('/admin/appointments')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Quay lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/appointments')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          Quay lại danh sách
        </button>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold mb-6">Chi tiết lịch hẹn #{appointment.id}</h2>
          
          {/* Thông tin bệnh nhân */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Thông tin bệnh nhân</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-semibold">{appointment.patient?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold">{appointment.patient?.phone}</p>
              </div>
            </div>
          </div>

          {/* Thông tin lịch hẹn */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Thông tin lịch hẹn</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bác sĩ</p>
                <p className="font-semibold">{appointment.doctor?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày giờ</p>
                <p className="font-semibold">
                  {new Date(appointment.appointment_time).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Lý do khám</p>
                <p className="font-semibold">{appointment.reason}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAppointmentDetail;