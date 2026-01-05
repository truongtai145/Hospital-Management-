import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, X, Loader, Shield } from 'lucide-react';
import AdminLayout from '../Components/AdminLayout';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination';

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ thanh toán' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Chờ xác nhận' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã thanh toán' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' },
  };
  
  const { bg, text, label } = config[status] || config.pending;
  
  return (
    <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold`}>
      {label}
    </span>
  );
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('processing');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_pending: 0,
    total_payments: 0,
    completed_payments: 0,
    pending_payments: 0,
  });

  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, currentPage, selectedDate]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // LỌC THEO payment_date THAY VÌ created_at
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 5,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        payment_date: selectedDate, // Thêm filter theo ngày thanh toán
      });
      
      const response = await api.get(`/admin/payments?${params}`);
      if (response.data.success) {
        const data = response.data.data;
        setPayments(data.data || data);
        setCurrentPage(data.current_page || 1);
        setLastPage(data.last_page || 1);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      // TÍNH DOANH THU THEO payment_date
      const startDate = `${selectedDate} 00:00:00`;
      const endDate = `${selectedDate} 23:59:59`;

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const response = await api.get(`/admin/payments/statistics/overview?${params}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Fetch payment statistics error:', error);
    }
  };

  const handleConfirm = async (paymentId) => {
    if (!window.confirm('Xác nhận đã nhận thanh toán tiền mặt?')) return;
    
    try {
      const response = await api.post(`/admin/payments/${paymentId}/confirm`);
      if (response.data.success) {
        toast.success('Đã xác nhận thanh toán!');
        fetchPayments();
        fetchStatistics(); // Cập nhật lại thống kê
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xác nhận thất bại');
    }
  };

  const handleCancel = async (paymentId) => {
    if (!window.confirm('Hủy hóa đơn này?')) return;
    
    try {
      const response = await api.post(`/admin/payments/${paymentId}/cancel`);
      if (response.data.success) {
        toast.success('Đã hủy hóa đơn!');
        fetchPayments();
        fetchStatistics(); // Cập nhật lại thống kê
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hủy thất bại');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý thanh toán</h1>
          <p className="text-gray-500 text-sm mt-1">Xác nhận thanh toán và quản lý hóa đơn</p>
        </div>

        {/* Filter + Doanh thu theo ngày */}
        <div className="bg-white rounded-xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Lọc trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tất cả</option>
              <option value="processing">Chờ xác nhận</option>
              <option value="completed">Đã thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
            </select>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ngày thanh toán:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="font-medium">Doanh thu ngày</span>
              <span className="font-semibold text-green-700">
                {formatCurrency(stats.total_revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader className="animate-spin" size={48} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>Không có hóa đơn nào trong ngày {formatDate(selectedDate)}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left">Mã HĐ</th>
                        <th className="p-4 text-left">Bệnh nhân</th>
                        <th className="p-4 text-left">Số tiền</th>
                        <th className="p-4 text-left">Phương thức</th>
                        <th className="p-4 text-left">Ngày TT</th>
                        <th className="p-4 text-center">Trạng thái</th>
                        <th className="p-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">#{payment.transaction_id}</td>
                          <td className="p-4">
                            <p className="font-medium">{payment.patient?.full_name}</p>
                            <p className="text-xs text-gray-500">{payment.patient?.phone}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-green-600">{formatCurrency(payment.total_amount)}</p>
                            {payment.discount > 0 && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Shield size={12} /> Giảm {formatCurrency(payment.discount)}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            {payment.payment_method === 'cash' ? 'Tiền mặt' :
                             payment.payment_method === 'vnpay' ? 'VNPay' :
                             payment.payment_method || '-'}
                          </td>
                          <td className="p-4">
                            {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                          </td>
                          <td className="p-4 text-center">
                            <StatusBadge status={payment.status} />
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {payment.status === 'processing' && (
                                <>
                                  <button
                                    onClick={() => handleConfirm(payment.id)}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                    title="Xác nhận"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleCancel(payment.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    title="Hủy"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                              {payment.status === 'completed' && (
                                <span className="text-green-600 text-sm">
                                  ✓ Hoàn tất
                                </span>
                              )}
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
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;