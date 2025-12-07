import React, { useState, useEffect, useMemo } from 'react';
import { X, DollarSign, FileText, Loader, AlertCircle, Shield, HeartPulse, User, Calendar, MapPin, Phone } from 'lucide-react';
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
      try {
        const response = await api.get(`/appointments/${appointment.id}/payment`);
        if (response.data.success && response.data.data) {
          const payment = response.data.data;
          setExistingPayment(payment);

          const originalSubTotal = parseFloat(payment.sub_total) || 0;
          const originalConsultationFee = parseFloat(payment.appointment?.doctor?.consultation_fee) || 0;
          const medCostFromServer = originalSubTotal - originalConsultationFee;

          setMedicationCost(medCostFromServer > 0 ? medCostFromServer.toString() : '');
          setNotes(payment.notes || '');
        } else {
          setExistingPayment(null);
          setMedicationCost('');
          setNotes('');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setExistingPayment(null);
        setMedicationCost('');
        setNotes('');
      } finally {
        setChecking(false);
      }
    };
    checkExistingPayment();
  }, [isOpen, appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (medicationCost === '' || parseFloat(medicationCost) < 0) {
      toast.error('Vui lòng nhập số tiền thuốc hợp lệ.');
      return;
    }

    setLoading(true);
    
    const payload = {
      appointment_id: appointment.id,
      medication_cost: medCost,
      notes: notes,
    };
    
    try {
      console.log('Sending payment request:', payload); // Debug log
      
      const response = await api.post('/admin/payments/create-or-update', payload);
      
      console.log('Payment response:', response.data); // Debug log

      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Payment error:', error.response || error); // Debug log
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !appointment) return null;

  const patient = appointment.patient;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center flex-shrink-0 rounded-t-2xl">
          <div>
            <h3 className="text-2xl font-bold">
              {existingPayment ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn thanh toán'}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
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

              {/* Form nhập liệu */}
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
                    placeholder="Nhập số tiền thuốc..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required 
                    min="0" 
                    step="1000"
                  />
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition"
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
                {existingPayment?.status === 'completed' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="font-semibold text-yellow-800">Hóa đơn đã được thanh toán</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Không thể cập nhật hóa đơn đã thanh toán. Vui lòng liên hệ quản trị viên nếu cần thay đổi.
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
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading || existingPayment?.status === 'completed'}
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
                        {existingPayment ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn'}
                      </>
                    )}
                  </button>
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