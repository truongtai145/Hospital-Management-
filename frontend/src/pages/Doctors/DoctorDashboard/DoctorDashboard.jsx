import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Stethoscope, FileText, Info, Loader, AlertCircle, ChevronLeft, User, Phone, CalendarDays } from 'lucide-react';
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
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

// Component Card lịch hẹn
const AppointmentCard = ({ appointment }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{appointment.patient?.full_name || 'N/A'}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone size={14} />
              {appointment.patient?.phone || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
        <StatusPill status={appointment.status} />
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span className="font-medium">
            {new Date(appointment.appointment_time).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <FileText size={16} className="text-gray-400 mt-0.5" />
          <span className="line-clamp-2">{appointment.reason}</span>
        </div>
      </div>
      
      <Link 
        to={`/doctor-dashboard/appointments/${appointment.id}`} 
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
      >
        Xem chi tiết
        <ChevronRight size={16}/>
      </Link>
    </div>
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
      const user = localStorage.getItem('user');
      doctorInfo = user ? JSON.parse(user) : null;
    }
  }

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchAppointments();
   
  }, []);

  useEffect(() => {
    filterAppointmentsByDate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, appointments, viewMode]);

  // Helper function để so sánh ngày
  const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Helper function để kiểm tra cùng tuần
  const isSameWeek = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const startOfWeek = new Date(d2);
    startOfWeek.setDate(d2.getDate() - d2.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return d1 >= startOfWeek && d1 <= endOfWeek;
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/doctor/appointments');
      
      if (response.data.success) {
        const appts = response.data.data || [];
        setAppointments(appts);
      } else {
        setError('API trả về kết quả không thành công');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể tải danh sách lịch hẹn.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointmentsByDate = () => {
    let filtered = [];
    
    if (viewMode === 'day') {
      filtered = appointments.filter(app => isSameDay(app.appointment_time, selectedDate));
    } else {
      filtered = appointments.filter(app => isSameWeek(app.appointment_time, selectedDate));
    }
    
    setFilteredAppointments(filtered);
    
    // Calculate stats
    const newStats = {
      total: filtered.length,
      pending: filtered.filter(a => a.status === 'pending').length,
      confirmed: filtered.filter(a => a.status === 'confirmed').length,
      completed: filtered.filter(a => a.status === 'completed').length,
    };
    setStats(newStats);
  };

  // Navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Count appointments for a specific date
  const getAppointmentCountForDate = (date) => {
    return appointments.filter(app => isSameDay(app.appointment_time, date)).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates();
  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="space-y-6">
      
      {/* Header Chào mừng */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Xin chào,  {doctorInfo?.profile?.full_name || 'Bác sĩ'}
            </h2>
            <p className="text-blue-100 text-lg">
              {isToday ? 'Hôm nay' : new Date(selectedDate).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })} có{' '}
              <strong className="text-white font-bold">{stats.total}</strong> lịch hẹn
            </p>
          </div>
          <Stethoscope size={80} className="text-white opacity-20" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Tổng lịch hẹn</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Chờ xác nhận</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đã xác nhận</p>
              <p className="text-3xl font-bold text-gray-800">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ChevronRight className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Đã hoàn thành</p>
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="text-blue-600" size={24}/> 
              Lịch làm việc
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'day' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Theo ngày
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'week' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Theo tuần
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Hôm nay
            </button>
            
            <span className="text-lg font-semibold text-gray-800 min-w-[200px] text-center">
              {viewMode === 'day' 
                ? selectedDate.toLocaleDateString('vi-VN', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : `Tuần ${Math.ceil(selectedDate.getDate() / 7)} - ${selectedDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}`
              }
            </span>
            
            <button
              onClick={goToNextDay}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-3 mb-6">
            {weekDates.map((date, index) => {
              const count = getAppointmentCountForDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isSameDay(date, new Date());
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50' 
                      : isTodayDate
                      ? 'border-blue-300 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {date.toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </p>
                  <p className={`text-2xl font-bold mb-2 ${
                    isSelected ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {date.getDate()}
                  </p>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {count} lịch
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock size={18} />
              Danh sách lịch hẹn ({filteredAppointments.length})
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments
                .sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time))
                .map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Info className="mx-auto mb-3 text-gray-300" size={64} />
            <p className="text-gray-500 font-medium text-lg">
              {viewMode === 'day' 
                ? (isToday ? 'Hôm nay không có lịch hẹn nào' : 'Ngày này không có lịch hẹn nào')
                : 'Tuần này không có lịch hẹn nào'
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Bạn có thể nghỉ ngơi hoặc xử lý công việc khác.
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tổng quan lịch hẹn</p>
            <p className="text-lg font-semibold text-gray-800">
              Tổng cộng có <span className="text-blue-600">{appointments.length}</span> lịch hẹn trong hệ thống
            </p>
          </div>
          <Link 
            to="/doctor-dashboard/appointments" 
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            Xem tất cả
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;