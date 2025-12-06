import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    no_show: "bg-gray-100 text-gray-700",
  };
  
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Đã khám",
    cancelled: "Đã hủy",
    no_show: "Vắng mặt",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDate, pagination.current_page]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterDate && { date: filterDate }),
      });

      const response = await api.get(`/admin/appointments?${params}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setAppointments(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
          per_page: data.per_page
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Không thể tải danh sách lịch hẹn';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/appointments/statistics/overview');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch statistics error:', error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await api.put(`/admin/appointments/${id}`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success('Cập nhật trạng thái thành công!');
        fetchAppointments();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return;
    
    try {
      const response = await api.delete(`/admin/appointments/${id}`);
      
      if (response.data.success) {
        toast.success('Đã xóa lịch hẹn thành công!');
        fetchAppointments();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa lịch hẹn');
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải danh sách...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch hẹn</h1>
          <p className="text-gray-500 text-sm mt-1">Xem và quản lý tất cả lịch hẹn trong hệ thống</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Tổng cộng" value={stats.total} color="blue" />
          <StatCard label="Chờ xác nhận" value={stats.pending} color="yellow" />
          <StatCard label="Đã xác nhận" value={stats.confirmed} color="blue" />
          <StatCard label="Đã hoàn thành" value={stats.completed} color="green" />
          <StatCard label="Đã hủy" value={stats.cancelled} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm bệnh nhân..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">ID</th>
                  <th className="p-4 font-semibold text-gray-700">Bệnh nhân</th>
                  <th className="p-4 font-semibold text-gray-700">Bác sĩ</th>
                  <th className="p-4 font-semibold text-gray-700">Ngày giờ</th>
                  <th className="p-4 font-semibold text-gray-700">Lý do</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-700">#{apt.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{apt.patient?.full_name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{apt.patient?.phone || ''}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{apt.doctor?.full_name || 'N/A'}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-700">
                          {new Date(apt.appointment_time).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.appointment_time).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">{apt.reason}</td>
                    <td className="p-4 text-center">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                              title="Xác nhận"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Hủy"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <Link
                          to={`/admin/appointments/${apt.id}`}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} của {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'border-blue-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500',
    red: 'border-red-500',
  };

  return (
    <div className={`bg-white p-4 rounded-lg border-l-4 ${colors[color]} shadow-sm`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default AdminAppointments;