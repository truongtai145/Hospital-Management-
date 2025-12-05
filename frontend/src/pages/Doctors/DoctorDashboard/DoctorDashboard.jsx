import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Stethoscope, FileText, Info, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';

// Component hiển thị trạng thái
const StatusPill = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
    completed: "bg-green-100 text-green-700 border border-green-300",
    cancelled: "bg-red-100 text-red-700 border border-red-300",
  };
  
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã khám",
    cancelled: "Đã hủy",
  };
  
  return (
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

const DoctorDashboard = ({ doctorInfo: propDoctorInfo }) => {
  // Ưu tiên prop, fallback về context
  let doctorInfo = propDoctorInfo;
  
  if (!doctorInfo) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const context = useOutletContext();
      doctorInfo = context?.doctorInfo;
    } catch {
      // Không có context, lấy từ localStorage
      doctorInfo = JSON.parse(localStorage.getItem('user'));
    }
  }
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      // ✅ Gọi API đúng endpoint
      const response = await api.get('/doctor/appointments');
      
      console.log('✅ API Response:', response.data);
      
      if (response.data.success) {
        const appointments = response.data.data;
        
        // Filter appointments for today
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(app => {
          const apptDate = new Date(app.appointment_time).toISOString().split('T')[0];
          return apptDate === today;
        });
        
        setTodayAppointments(todayAppts);
        
        // Calculate stats
        setStats({
          total: todayAppts.length,
          pending: todayAppts.filter(a => a.status === 'pending').length,
          confirmed: todayAppts.filter(a => a.status === 'confirmed').length,
          completed: todayAppts.filter(a => a.status === 'completed').length,
        });
      }
    } catch (error) {
      console.error('❌ Fetch error:', error.response || error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Chào mừng */}
      <div className="bg-gradient-to-r from-primary to-blue-800 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Xin chào, BS. {doctorInfo?.profile?.full_name || 'Bác sĩ'}
          </h2>
          <p className="text-blue-100">
            Chúc bác sĩ một ngày làm việc hiệu quả. Hôm nay có{' '}
            <strong className="text-white font-bold">{stats.total}</strong> bệnh nhân trong lịch khám.
          </p>
        </div>
        <Stethoscope size={120} className="absolute right-4 bottom-4 text-white opacity-10" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng lịch hẹn</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Chờ xác nhận</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đã xác nhận</p>
              <p className="text-3xl font-bold text-gray-800">{stats.confirmed}</p>
            </div>
            <ChevronRight className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đã hoàn thành</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <FileText className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Lịch khám hôm nay */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-secondary" size={24}/> 
              Lịch khám hôm nay
            </h3>
            <span className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              {new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-sm border-b border-gray-200">
              <tr>
                <th className="p-4 w-24">Giờ</th>
                <th className="p-4">Bệnh nhân</th>
                <th className="p-4">Liên hệ</th>
                <th className="p-4">Triệu chứng/Lý do</th>
                <th className="p-4 text-center w-32">Trạng thái</th>
                <th className="p-4 w-32">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {todayAppointments.length > 0 ? (
                todayAppointments
                  .sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time))
                  .map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-bold text-primary flex items-center gap-2">
                        <Clock size={16} className="text-gray-400"/> 
                        {new Date(app.appointment_time).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-800">{app.patient?.full_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">ID: #{app.patient?.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">{app.patient?.phone || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-gray-500">{app.email || ''}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700 line-clamp-2">{app.reason}</p>
                      </td>
                      <td className="p-4 text-center">
                        <StatusPill status={app.status} />
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/doctor-dashboard/appointments/${app.id}`} 
                          className="inline-flex items-center gap-1 bg-secondary text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                        >
                          Xem chi tiết
                          <ChevronRight size={16}/>
                        </Link>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <Info className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-gray-500 font-medium">Hôm nay không có lịch hẹn nào.</p>
                    <p className="text-sm text-gray-400 mt-1">Bạn có thể nghỉ ngơi hoặc xử lý công việc khác.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;