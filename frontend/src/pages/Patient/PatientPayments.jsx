import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Calendar, User, Loader, AlertCircle, CheckCircle, Clock, DollarSign, Shield, X, Phone, MapPin, Activity, Stethoscope, Pill, Filter } from 'lucide-react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Chờ thanh toán' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Chờ xác nhận' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Đã thanh toán' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: X, label: 'Đã hủy' },
  };
  
  const { bg, text, icon: Icon, label } = config[status] || config.pending;
  
  return (
    <span className={`${bg} ${text} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit`}>
      <Icon size={14} />
      {label}
    </span>
  );
};

// Modal Thanh Toán
const PaymentModal = ({ isOpen, onClose, payment, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: '💵', note: 'Thanh toán tại quầy - Cần xác nhận từ nhân viên' },
    { value: 'credit_card', label: 'Thẻ tín dụng', icon: '💳', note: 'Thanh toán ngay lập tức' },
    { value: 'vnpay', label: 'VNPay', icon: '💰', note: 'Thanh toán qua cổng VNPay - Tự động xác nhận' },
  ];

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!paymentMethod) {
    toast.error('Vui lòng chọn phương thức thanh toán');
    return;
  }

  setLoading(true);
  try {
    // ✅ XỬ LÝ VNPAY
    if (paymentMethod === 'vnpay') {
      const response = await api.post('/patient/payments/create-vnpay', {
        payment_id: payment.id
      });

      if (response.data.success && response.data.paymentUrl) {
        // Chuyển hướng đến VNPay
        window.location.href = response.data.paymentUrl;
        return;
      }
    } else {
      // Xử lý các phương thức khác
      const response = await api.post(`/patient/payments/${payment.id}/pay`, {
        payment_method: paymentMethod
      });

      if (response.data.success) {
        toast.success('Thanh toán thành công!');
        onSuccess?.();
        onClose();
      }
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Thanh toán thất bại');
  } finally {
    setLoading(false);
  }
};

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold">Thanh toán hóa đơn</h3>
          <p className="text-green-100 text-sm mt-1">Mã hóa đơn: {payment.transaction_id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-2xl text-green-600">{formatCurrency(payment.total_amount)}</span>
            </div>
            {payment.discount > 0 && (
              <div className="text-sm text-green-600 flex items-center gap-1">
                <Shield size={14} />
                Đã áp dụng BHYT: -{formatCurrency(payment.discount)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Chọn phương thức thanh toán
            </label>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <label
                  key={method.value}
                  className={`flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === method.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-medium text-gray-800">{method.label}</span>
                  </div>
                  {method.note && (
                    <p className="text-xs text-gray-500 ml-12">{method.note}</p>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Xác nhận thanh toán
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component chính
const PatientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    // Lọc payments theo trạng thái
    if (filterStatus === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(p => p.status === filterStatus));
    }
  }, [filterStatus, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patient/payments');
      if (response.data.success) {
        setPayments(response.data.data);
        setFilteredPayments(response.data.data);
      }
    } catch (error) {
      console.error('Fetch payments error:', error);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="text-gray-400 mx-auto mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có hóa đơn nào</h3>
          <p className="text-gray-500">Bạn chưa có hóa đơn thanh toán nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <CreditCard className="text-blue-600" size={36} />
            Hóa đơn thanh toán
          </h1>
          <p className="text-gray-600 mt-2">Quản lý và thanh toán hóa đơn khám bệnh của bạn</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng hóa đơn</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{payments.length}</p>
              </div>
              <FileText className="text-blue-600" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Chờ thanh toán</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-600" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Đã thanh toán</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <span className="font-semibold text-gray-700">Lọc theo trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Tất cả ({payments.length})</option>
              <option value="pending">Chờ thanh toán ({payments.filter(p => p.status === 'pending').length})</option>
              <option value="completed">Đã thanh toán ({payments.filter(p => p.status === 'completed').length})</option>
            </select>
          </div>
        </div>

        {/* Payment List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Không có hóa đơn nào phù hợp với bộ lọc</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPayments.map(payment => {
              const patient = payment.patient;
              const appointment = payment.appointment;
              const doctor = appointment?.doctor;
              
              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <FileText size={24} />
                          Hóa đơn #{payment.transaction_id}
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">
                          Ngày tạo: {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Thông tin bệnh nhân */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                      <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <User size={20} />
                        Thông tin bệnh nhân
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                          <User size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Họ và tên</p>
                            <p className="font-semibold text-gray-900">{patient?.full_name || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Ngày sinh</p>
                            <p className="font-semibold text-gray-900">{formatDate(patient?.date_of_birth)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Activity size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Giới tính</p>
                            <p className="font-semibold text-gray-900">
                              {patient?.gender === 'male' ? 'Nam' : patient?.gender === 'female' ? 'Nữ' : 'Khác'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Số điện thoại</p>
                            <p className="font-semibold text-gray-900">{patient?.phone || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 md:col-span-2">
                          <MapPin size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Địa chỉ</p>
                            <p className="font-semibold text-gray-900">{patient?.address || 'Chưa cập nhật'}</p>
                          </div>
                        </div>

                        {patient?.insurance_number && (
                          <div className="flex items-start gap-3 md:col-span-2 bg-green-50 -m-2 p-3 rounded-lg border border-green-200">
                            <Shield size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-600 text-xs">Số BHYT</p>
                              <p className="font-semibold text-green-700">{patient.insurance_number}</p>
                              <p className="text-xs text-green-600 mt-1">✓ Được giảm 20% chi phí</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thông tin bác sĩ và khám bệnh */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Stethoscope size={20} />
                        Thông tin khám bệnh
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-start gap-3">
                          <User size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Bác sĩ</p>
                            <p className="font-semibold text-gray-900">{doctor?.full_name || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Activity size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Khoa</p>
                            <p className="font-semibold text-gray-900">{doctor?.department?.name || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Ngày khám</p>
                            <p className="font-semibold text-gray-900">{formatDate(appointment?.appointment_time)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <FileText size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-600 text-xs">Lý do khám</p>
                            <p className="font-semibold text-gray-900">{appointment?.reason || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Chẩn đoán */}
                      {appointment?.doctor_notes && (
                        <div className="border-t border-blue-200 pt-4 mb-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Activity size={16} className="text-blue-700 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 font-semibold text-sm">Chẩn đoán:</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <p className="text-gray-800 text-sm leading-relaxed">{appointment.doctor_notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Đơn thuốc */}
                      {appointment?.prescription && (
                        <div className="border-t border-blue-200 pt-4">
                          <div className="flex items-start gap-2 mb-2">
                            <Pill size={16} className="text-blue-700 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 font-semibold text-sm">Đơn thuốc:</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-blue-100">
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{appointment.prescription}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chi phí */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6">
                      <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <DollarSign size={20} />
                        Chi tiết thanh toán
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-gray-700">
                          <span>Phí khám bác sĩ:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(doctor?.consultation_fee || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                          <span>Tiền thuốc:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(payment.sub_total - (doctor?.consultation_fee || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 border-t border-dashed border-emerald-300 pt-3">
                          <span className="font-medium">Tạm tính:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(payment.sub_total)}</span>
                        </div>
                        {payment.discount > 0 && (
                          <div className="flex justify-between items-center text-red-600 bg-red-50 -mx-2 px-4 py-2 rounded-lg">
                            <span className="font-medium flex items-center gap-2">
                              <Shield size={16} />
                              Giảm giá BHYT (20%):
                            </span>
                            <span className="font-semibold">-{formatCurrency(payment.discount)}</span>
                          </div>
                        )}
                        <div className="border-t-2 border-emerald-400 pt-4 flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-800">TỔNG CỘNG:</span>
                          <span className="text-3xl font-bold text-emerald-600">{formatCurrency(payment.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú */}
                    {payment.notes && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <p className="font-semibold text-amber-900 mb-1 text-sm">Ghi chú:</p>
                        <p className="text-amber-800 text-sm">{payment.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handleOpenPayment(payment)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                      >
                        <DollarSign size={24} />
                        Thanh toán ngay
                      </button>
                    )}

                    {payment.status === 'processing' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                          <Clock size={24} />
                          <span className="font-bold text-lg">Đang chờ xác nhận</span>
                        </div>
                        <p className="text-sm text-blue-600 mb-2">
                          Bạn đã chọn thanh toán bằng tiền mặt
                        </p>
                        <p className="text-xs text-blue-500">
                          Vui lòng đến quầy thu ngân để hoàn tất thanh toán. Nhân viên sẽ xác nhận sau khi nhận tiền.
                        </p>
                      </div>
                    )}

                    {payment.status === 'completed' && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                          <CheckCircle size={24} />
                          <span className="font-bold text-lg">Đã thanh toán</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Ngày thanh toán: {formatDate(payment.payment_date)}
                        </p>
                        {payment.payment_method && (
                          <p className="text-sm text-green-600 mt-1">
                            Phương thức: {
                              payment.payment_method === 'cash' ? 'Tiền mặt' : 
                              payment.payment_method === 'credit_card' ? 'Thẻ tín dụng' : 
                              payment.payment_method === 'bank_transfer' ? 'Chuyển khoản' :
                              payment.payment_method === 'momo' ? 'MoMo' :
                              payment.payment_method === 'vnpay' ? 'VNPay' :
                              payment.payment_method
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onSuccess={fetchPayments}
      />
    </div>
  );
};

export default PatientPayments;