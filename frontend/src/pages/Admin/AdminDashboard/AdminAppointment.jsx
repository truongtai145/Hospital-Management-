import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../Components/AdminLayout";
import AdminPaymentModal from "../AdminDashboard/AdminPaymentModal";
import { api } from "../../../api/axios";
import { toast } from "react-toastify";
import Pagination from "../../../components/Pagination/Pagination";

const StatusBadge = ({ status, appointmentId, paymentsStatus }) => {
  const paymentStatus = paymentsStatus[appointmentId];
  
  if (status === 'completed') {
    return (
      <div className="flex flex-col gap-1">
        {/* Badge trạng thái khám */}
        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 text-center">
          ✓ Đã khám
        </span>
        
        {/* Badge trạng thái hóa đơn */}
        {paymentStatus === 'paid' ? (
          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700 text-center">
            ✓ Có hóa đơn
          </span>
        ) : paymentStatus === 'unpaid' ? (
          <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 text-center">
            ⚠ Chưa có HĐ
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 text-center">
            <Loader size={10} className="inline animate-spin" /> Kiểm tra...
          </span>
        )}
      </div>
    );
  }

  const config = {
    pending: { 
      label: "⏳ Chờ xác nhận", 
      className: "bg-yellow-100 text-yellow-700" 
    },
    confirmed: { 
      label: "✓ Đã xác nhận", 
      className: "bg-blue-100 text-blue-700" 
    },
    cancelled: { 
      label: "✗ Đã hủy", 
      className: "bg-red-100 text-red-700" 
    },
    no_show: { 
      label: "⊘ Vắng mặt", 
      className: "bg-gray-100 text-gray-700" 
    },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
      {label}
    </span>
  );
};

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Payment Status States
  const [paymentsStatus, setPaymentsStatus] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Payment Modal States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterDate, currentPage]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch payment statuses for completed appointments
  useEffect(() => {
    const fetchPaymentStatuses = async () => {
      if (appointments.length === 0) return;
      
      setLoadingPayments(true);
      const statuses = {};
      
      const completedAppointments = appointments.filter(apt => apt.status === 'completed');
      
      await Promise.all(
        completedAppointments.map(async (apt) => {
          try {
            const response = await api.get(`/appointments/${apt.id}/payment`);
            statuses[apt.id] = response.data.success && response.data.data ? 'paid' : 'unpaid';
          } catch {
            statuses[apt.id] = 'unpaid';
          }
        })
      );
      
      setPaymentsStatus(statuses);
      setLoadingPayments(false);
    };

    if (appointments.length > 0) {
      fetchPaymentStatuses();
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 5,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterDate && { date: filterDate }),
      });

      const response = await api.get(`/admin/appointments?${params}`);

      if (response.data.success) {
        const data = response.data.data;
        setAppointments(data.data || []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Không thể tải danh sách lịch hẹn";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/appointments/statistics/overview");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Fetch statistics error:", error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await api.put(`/admin/appointments/${id}`, {
        status: newStatus,
      });

      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công!");
        fetchAppointments();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) return;

    try {
      const response = await api.delete(`/admin/appointments/${id}`);

      if (response.data.success) {
        toast.success("Đã xóa lịch hẹn thành công!");
        fetchAppointments();
        fetchStatistics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa lịch hẹn");
    }
  };

  const handleOpenPaymentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedAppointment(null);
    // Refresh payment statuses after modal closes
    fetchAppointments();
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
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Có lỗi xảy ra
            </p>
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
          <p className="text-gray-500 text-sm mt-1">
            Xem và quản lý tất cả lịch hẹn trong hệ thống
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Tổng cộng" value={stats.total} color="blue" />
          <StatCard label="Chờ xác nhận" value={stats.pending} color="yellow" />
          <StatCard label="Đã xác nhận" value={stats.confirmed} color="blue" />
          <StatCard
            label="Đã hoàn thành"
            value={stats.completed}
            color="green"
          />
          <StatCard label="Đã hủy" value={stats.cancelled} color="red" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm bệnh nhân..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã khám</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
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
                  <th className="p-4 font-semibold text-gray-700 text-center">
                    Trạng thái
                  </th>
                  <th className="p-4 font-semibold text-gray-700 text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-700">#{apt.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {apt.patient?.full_name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {apt.patient?.phone || ""}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {apt.doctor?.full_name || "N/A"}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-gray-700">
                          {new Date(apt.appointment_time).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.appointment_time).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">
                      {apt.reason}
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge 
                        status={apt.status} 
                        appointmentId={apt.id}
                        paymentsStatus={paymentsStatus}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {apt.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(apt.id, "confirmed")
                              }
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                              title="Xác nhận"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(apt.id, "cancelled")
                              }
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                              title="Hủy"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {apt.status === "completed" && (
                          <button
                            onClick={() => handleOpenPaymentModal(apt)}
                            className={`p-2 rounded-lg transition ${
                              paymentsStatus[apt.id] === 'paid'
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            }`}
                            title={paymentsStatus[apt.id] === 'paid' ? 'Xem hóa đơn' : 'Tạo hóa đơn'}
                          >
                            <DollarSign size={16} />
                          </button>
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
          <Pagination
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <AdminPaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        appointment={selectedAppointment}
        onSuccess={() => {
          fetchAppointments();
          fetchStatistics();
        }}
      />
    </AdminLayout>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: "border-blue-500",
    yellow: "border-yellow-500",
    green: "border-green-500",
    red: "border-red-500",
  };

  return (
    <div
      className={`bg-white p-4 rounded-lg border-l-4 ${colors[color]} shadow-sm`}
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default AdminAppointments;