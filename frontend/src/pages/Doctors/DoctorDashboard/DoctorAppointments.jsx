import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, Filter, User, Phone, FileText, Loader, AlertCircle, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';

// Status Badge Component
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
    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDate, appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/doctor/appointments');
      
      if (response.data.success) {
        const appts = response.data.data || [];
        setAppointments(appts);
        
        // Calculate stats
        const newStats = {
          total: appts.length,
          pending: appts.filter(a => a.status === 'pending').length,
          confirmed: appts.filter(a => a.status === 'confirmed').length,
          completed: appts.filter(a => a.status === 'completed').length,
          cancelled: appts.filter(a => a.status === 'cancelled').length,
        };
        setStats(newStats);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải danh sách lịch hẹn";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient?.phone?.includes(searchTerm) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    
    // Filter by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterDate === 'today') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointment_time);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      });
    } else if (filterDate === 'upcoming') {
      filtered = filtered.filter(apt => new Date(apt.appointment_time) >= today);
    } else if (filterDate === 'past') {
      filtered = filtered.filter(apt => new Date(apt.appointment_time) < today);
    }
    
    // Sort by appointment time (descending)
    filtered.sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));
    
    setFilteredAppointments(filtered);
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchAppointments(); // Refresh list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải danh sách lịch hẹn...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Calendar className="text-blue-600" size={28} />
              Quản lý lịch hẹn
            </h2>
            <p className="text-gray-500">
              Xem và quản lý tất cả lịch hẹn của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Tổng cộng</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 mb-1">Chờ xác nhận</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 mb-1">Đã xác nhận</p>
          <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 mb-1">Đã hoàn thành</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 mb-1">Đã hủy</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tên bệnh nhân, SĐT..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Filter size={16} />
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Calendar size={16} />
              Thời gian
            </label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="upcoming">Sắp tới</option>
              <option value="past">Đã qua</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Ngày & Giờ</th>
                  <th className="p-4 font-semibold text-gray-700">Bệnh nhân</th>
                  <th className="p-4 font-semibold text-gray-700">Liên hệ</th>
                  <th className="p-4 font-semibold text-gray-700">Lý do khám</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(apt.appointment_time).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(apt.appointment_time).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {apt.patient?.full_name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{apt.patient?.full_name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">ID: #{apt.patient?.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{apt.patient?.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <FileText size={16} className="text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600 line-clamp-2">{apt.reason}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              title="Xác nhận"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              title="Hủy"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/doctor-dashboard/appointments/${apt.id}`}
                          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Chi tiết
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto mb-3 text-gray-300" size={64} />
          <p className="text-gray-500 font-medium text-lg">
            Không tìm thấy lịch hẹn nào
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Thử thay đổi bộ lọc hoặc tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;