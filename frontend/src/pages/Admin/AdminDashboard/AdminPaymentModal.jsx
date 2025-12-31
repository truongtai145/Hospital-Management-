import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, FileText, Loader, AlertCircle, Shield, HeartPulse, User, Calendar, MapPin, Phone, CheckCircle, Edit } from 'lucide-react';
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberValue);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const AdminPaymentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [medicationCost, setMedicationCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  const [checking, setChecking] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Xác định trạng thái hóa đơn
  const paymentStatus = useMemo(() => {
    if (!existingPayment) {
      return {
        type: 'NEW',
        label: 'Chưa có hóa đơn',
        color: 'gray',
        canEdit: true,
        icon: DollarSign
      };
    }

    if (existingPayment.status === 'completed') {
      return {
        type: 'PAID',
        label: 'Đã thanh toán',
        color: 'green',
        canEdit: false,
        icon: CheckCircle
      };
    }

    return {
      type: 'DRAFT',
      label: 'Đã lưu nháp',
      color: 'blue',
      canEdit: true,
      icon: Edit
    };
  }, [existingPayment]);

  // Tính toán hóa đơn
  const { 
    consultationFee, 
    medCost, 
    subTotal, 
    hasInsurance, 
    insuranceDiscount, 
    totalAmount 
  } = useMemo(() => {
    const consultationFeeNum = parseFloat(appointment?.doctor?.consultation_fee) || 0;
    const medCostNum = parseFloat(medicationCost) || 0;
    const subTotalNum = consultationFeeNum + medCostNum;
    const hasInsuranceBool = !!appointment?.patient?.insurance_number;
    const insuranceDiscountNum = hasInsuranceBool ? subTotalNum * 0.20 : 0;
    const totalAmountNum = subTotalNum - insuranceDiscountNum;

    return { 
      consultationFee: consultationFeeNum, 
      medCost: medCostNum, 
      subTotal: subTotalNum, 
      hasInsurance: hasInsuranceBool, 
      insuranceDiscount: insuranceDiscountNum, 
      totalAmount: totalAmountNum 
    };
  }, [medicationCost, appointment]);

  // Kiểm tra hóa đơn đã tồn tại
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (!isOpen || !appointment) return;
      
      setChecking(true);
      setIsEditing(false);
      
      try {
        const response = await api.get(`/appointments/${appointment.id}/payment`);
        if (response.data.success && response.data.data) {
          const payment = response.data.data;
          setExistingPayment(payment);

          // Tính toán medication_cost từ dữ liệu có sẵn
          const originalSubTotal = parseFloat(payment.sub_total) || 0;
          const originalConsultationFee = parseFloat(payment.appointment?.doctor?.consultation_fee) || 0;
          const medCostFromServer = originalSubTotal - originalConsultationFee;

          setMedicationCost(medCostFromServer > 0 ? medCostFromServer.toString() : '');
          setNotes(payment.notes || '');
        } else {
          // Chưa có hóa đơn
          setExistingPayment(null);
          setMedicationCost('');
          setNotes('');
          setIsEditing(true); // Tự động cho phép nhập
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // Lỗi hoặc chưa có hóa đơn
        setExistingPayment(null);
        setMedicationCost('');
        setNotes('');
        setIsEditing(true);
      } finally {
        setChecking(false);
      }
    };
    checkExistingPayment();
  }, [isOpen, appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (medicationCost === '' || parseFloat(medicationCost) < 0) {
      toast.error('Vui lòng nhập số tiền thuốc hợp lệ (>= 0).');
      return;
    }

    // Không cho phép sửa hóa đơn đã thanh toán
    if (paymentStatus.type === 'PAID') {
      toast.error('Không thể chỉnh sửa hóa đơn đã thanh toán!');
      return;
    }

    setLoading(true);
    
    const payload = {
      appointment_id: appointment.id,
      medication_cost: medCost,
      notes: notes,
    };
    
    try {
      const response = await api.post('/admin/payments/create-or-update', payload);

      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error.response || error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableEdit = () => {
    if (paymentStatus.type === 'PAID') {
      toast.warning('Không thể chỉnh sửa hóa đơn đã thanh toán!');
      return;
    }
    setIsEditing(true);
  };

  if (!isOpen || !appointment) return null;

  const patient = appointment.patient;
  const StatusIcon = paymentStatus.icon;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          paymentStatus.type === 'PAID' ? 'from-green-600 to-green-800' :
          paymentStatus.type === 'DRAFT' ? 'from-blue-600 to-blue-800' :
          'from-gray-600 to-gray-800'
        } text-white p-6 flex justify-between items-center flex-shrink-0 rounded-t-2xl`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">
                {paymentStatus.type === 'NEW' ? 'Tạo hóa đơn thanh toán' :
                 paymentStatus.type === 'PAID' ? 'Chi tiết hóa đơn đã thanh toán' :
                 'Cập nhật hóa đơn'}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                paymentStatus.type === 'PAID' ? 'bg-green-500' :
                paymentStatus.type === 'DRAFT' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}>
                <StatusIcon size={14} />
                {paymentStatus.label}
              </span>
            </div>
            <p className="text-white/90 text-sm">
              Lịch hẹn #{appointment.id} - {patient?.full_name}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {checking ? (
            <div className="flex justify-center items-center py-20 space-x-3">
              <Loader className="animate-spin text-blue-600" size={32} />
              <span className="text-gray-600 text-lg">Đang kiểm tra hóa đơn...</span>
            </div>
          ) : (
            <>
              {/* Trạng thái hóa đơn */}
              {paymentStatus.type !== 'NEW' && (
                <div className={`mb-6 p-4 rounded-lg border-2 ${
                  paymentStatus.type === 'PAID' 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <StatusIcon className={
                      paymentStatus.type === 'PAID' ? 'text-green-600' : 'text-blue-600'
                    } size={24} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {paymentStatus.type === 'PAID' 
                          ? '✓ Hóa đơn đã được thanh toán'
                          : 'Hóa đơn đã được lưu (chưa thanh toán)'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {paymentStatus.type === 'PAID'
                          ? `Thanh toán lúc: ${formatDate(existingPayment?.payment_date)}`
                          : 'Bạn có thể chỉnh sửa và cập nhật hóa đơn này'}
                      </p>
                      {existingPayment?.payment_method && (
                        <p className="text-sm text-gray-600">
                          Phương thức: <span className="font-semibold">{existingPayment.payment_method}</span>
                        </p>
                      )}
                    </div>
                    {paymentStatus.type === 'DRAFT' && !isEditing && (
                      <button
                        onClick={handleEnableEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Thông tin bệnh nhân */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Thông tin bệnh nhân
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-xs">Họ và tên</p>
                      <p className="font-semibold text-gray-900">{patient?.full_name || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-xs">Ngày sinh</p>
                      <p className="font-semibold text-gray-900">{formatDate(patient?.date_of_birth)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-xs">Giới tính</p>
                      <p className="font-semibold text-gray-900">
                        {patient?.gender === 'male' ? 'Nam' : patient?.gender === 'female' ? 'Nữ' : 'Khác'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-xs">Số điện thoại</p>
                      <p className="font-semibold text-gray-900">{patient?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin size={18} className="text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-gray-600 text-xs">Địa chỉ</p>
                      <p className="font-semibold text-gray-900">{patient?.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  {patient?.insurance_number && (
                    <div className="flex items-start gap-3 md:col-span-2 bg-green-50 -m-2 p-3 rounded-lg border border-green-200">
                      <Shield size={18} className="text-green-600 mt-0.5" />
                      <div>
                        <p className="text-gray-600 text-xs">Số BHYT</p>
                        <p className="font-semibold text-green-700">{patient.insurance_number}</p>
                        <p className="text-xs text-green-600 mt-1">✓ Được giảm 20% chi phí</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin khám bệnh */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <HeartPulse size={20} />
                  Thông tin khám bệnh
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600 text-xs">Bác sĩ</p>
                    <p className="font-semibold text-gray-900">{appointment.doctor?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Ngày khám</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(appointment.appointment_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Phí khám</p>
                    <p className="font-semibold text-blue-700">{formatCurrency(consultationFee)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Lý do khám</p>
                    <p className="font-semibold text-gray-900">{appointment.reason || 'N/A'}</p>
                  </div>
                </div>

                {(appointment.doctor_notes || appointment.prescription) && (
                  <div className="border-t border-blue-200 pt-4 space-y-3">
                    {appointment.doctor_notes && (
                      <div>
                        <p className="text-gray-700 font-medium text-xs mb-1">Chẩn đoán:</p>
                        <p className="text-gray-800 text-sm bg-white p-3 rounded-lg border border-blue-100">
                          {appointment.doctor_notes}
                        </p>
                      </div>
                    )}
                    {appointment.prescription && (
                      <div>
                        <p className="text-gray-700 font-medium text-xs mb-1">Đơn thuốc:</p>
                        <p className="text-gray-800 text-sm bg-white p-3 rounded-lg border border-blue-100 whitespace-pre-wrap">
                          {appointment.prescription}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form nhập liệu hoặc hiển thị readonly */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="med_cost" className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <DollarSign size={18} className="text-green-600" />
                    Tiền thuốc <span className="text-red-500">*</span>
                  </label>
                  <input 
                    id="med_cost" 
                    type="number" 
                    value={medicationCost}
                    onChange={(e) => setMedicationCost(e.target.value)}
                    placeholder="Nhập số tiền thuốc (VD: 50000)..."
                    className={`w-full px-4 py-3 border-2 rounded-lg transition ${
                      paymentStatus.type === 'PAID' || !isEditing
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    required 
                    min="0" 
                    step="1000"
                    disabled={paymentStatus.type === 'PAID' || !isEditing}
                    readOnly={paymentStatus.type === 'PAID' || !isEditing}
                  />
                  {!isEditing && paymentStatus.type === 'DRAFT' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Nhấn nút "Chỉnh sửa" ở trên để thay đổi giá trị
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2 items-center gap-2">
                    <FileText size={18} className="text-gray-600" />
                    Ghi chú
                  </label>
                  <textarea 
                    id="notes" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú về hóa đơn (tùy chọn)..." 
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-lg resize-none transition ${
                      paymentStatus.type === 'PAID' || !isEditing
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    disabled={paymentStatus.type === 'PAID' || !isEditing}
                    readOnly={paymentStatus.type === 'PAID' || !isEditing}
                  />
                </div>

                {/* Tổng tiền */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-6 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Phí khám bác sĩ:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(consultationFee)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Tiền thuốc:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(medCost)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-700 border-t border-dashed border-emerald-300 pt-3">
                    <span className="font-medium">Tạm tính:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(subTotal)}</span>
                  </div>
                  {hasInsurance && (
                    <div className="flex justify-between items-center text-red-600 bg-red-50 -mx-2 px-2 py-2 rounded-lg">
                      <span className="font-medium flex items-center gap-2">
                        <Shield size={16} />
                        Giảm giá BHYT (20%):
                      </span>
                      <span className="font-semibold">-{formatCurrency(insuranceDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-400 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">TỔNG CỘNG:</span>
                    <span className="text-3xl font-bold text-emerald-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Cảnh báo nếu đã thanh toán */}
                {paymentStatus.type === 'PAID' && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-green-800">Hóa đơn đã được thanh toán</p>
                        <p className="text-sm text-green-700 mt-1">
                          Hóa đơn này đã được xác nhận thanh toán và không thể chỉnh sửa.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 -mx-6 px-6 border-t">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
                  >
                    {paymentStatus.type === 'PAID' ? 'Đóng' : 'Hủy'}
                  </button>
                  
                  {paymentStatus.canEdit && isEditing && (
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={20} />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <DollarSign size={20} />
                          {paymentStatus.type === 'NEW' ? 'Tạo hóa đơn' : 'Cập nhật hóa đơn'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentModal;