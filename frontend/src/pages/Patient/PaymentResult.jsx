// src/pages/patient/PaymentResult.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, FileText, Calendar, DollarSign, Hash, ArrowLeft, Home } from "lucide-react";

// Format VND
const formatVnd = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(value);
};

// Format ngày giờ
const formatDateTime = () => {
  return new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  // Lấy thông tin từ URL params
  const status = searchParams.get("status");
  const paymentId = searchParams.get("paymentId");
  const amount = searchParams.get("amount");
  const txnRef = searchParams.get("txnRef");
  const error = searchParams.get("error");
  const responseCode = searchParams.get("responseCode");

  useEffect(() => {
    // Đếm ngược tự động chuyển trang
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/patient/payments");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Mã lỗi VNPay
  const getErrorMessage = (code) => {
    const errorMessages = {
      '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
      '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
      '10': 'Thẻ/Tài khoản không đúng',
      '11': 'Thẻ/Tài khoản hết hạn',
      '12': 'Thẻ/Tài khoản bị khóa',
      '13': 'Thẻ/Tài khoản không đủ số dư',
      '24': 'Giao dịch bị hủy',
      '51': 'Thẻ/Tài khoản không đủ số dư',
      '65': 'Thẻ/Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
      '75': 'Ngân hàng thanh toán đang bảo trì',
      '79': 'Giao dịch vượt quá số lần nhập sai mật khẩu',
      '99': 'Các lỗi khác',
      'invalid_checksum': 'Giao dịch không hợp lệ do chữ ký không đúng',
      'payment_not_found': 'Không tìm thấy hóa đơn trong hệ thống',
      'invalid_txn_ref': 'Mã giao dịch không hợp lệ',
    };
    return errorMessages[code] || 'Lỗi không xác định';
  };

  // ✅ THANH TOÁN THÀNH CÔNG
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thành công! 🎉</h1>
            <p className="text-green-100">Hóa đơn của bạn đã được thanh toán và xác nhận</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Thông tin giao dịch */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                <FileText size={22} />
                Chi tiết giao dịch
              </h3>
              <div className="space-y-3">
                {paymentId && (
                  <div className="flex items-center justify-between py-3 border-b border-green-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash size={18} className="text-green-600" />
                      <span>Mã hóa đơn:</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">#{paymentId}</span>
                  </div>
                )}
                
                {txnRef && (
                  <div className="flex items-center justify-between py-3 border-b border-green-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash size={18} className="text-green-600" />
                      <span>Mã giao dịch:</span>
                    </div>
                    <span className="font-mono text-sm text-gray-900 font-semibold break-all text-right max-w-xs">
                      {txnRef}
                    </span>
                  </div>
                )}

                {amount && (
                  <div className="flex items-center justify-between py-3 border-b border-green-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={18} className="text-green-600" />
                      <span>Số tiền:</span>
                    </div>
                    <span className="font-bold text-green-600 text-2xl">
                      {formatVnd(parseFloat(amount))}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-green-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={18} className="text-green-600" />
                    <span>Thời gian:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatDateTime()}</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={18} className="text-green-600" />
                    <span>Phương thức:</span>
                  </div>
                  <span className="font-semibold text-gray-900 bg-blue-100 px-3 py-1 rounded-full text-sm">
                    VNPay
                  </span>
                </div>
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Vui lòng lưu lại mã giao dịch để tra cứu</li>
                    <li>Hóa đơn điện tử sẽ được gửi qua email (nếu có)</li>
                    <li>Bạn có thể xem lại hóa đơn trong mục "Hóa đơn thanh toán"</li>
                    <li>Liên hệ hotline <strong>1900 xxxx</strong> nếu cần hỗ trợ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Tự động chuyển về trang hóa đơn sau <span className="font-bold text-green-600 text-lg">{countdown}</span> giây...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/patient/payments")}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <FileText size={20} />
                Xem tất cả hóa đơn
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ❌ THANH TOÁN THẤT BẠI
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-8 text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <XCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Thanh toán thất bại</h1>
            <p className="text-red-100">Đã có lỗi xảy ra trong quá trình thanh toán</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Thông tin lỗi */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 text-lg">
                <AlertCircle size={22} />
                Thông tin lỗi
              </h3>
              
              <div className="space-y-4">
                {paymentId && (
                  <div className="bg-white p-4 rounded-lg border border-red-100">
                    <p className="text-gray-600 text-sm mb-1">Mã hóa đơn:</p>
                    <p className="font-bold text-gray-900">#{paymentId}</p>
                  </div>
                )}

                {(error || responseCode) && (
                  <div className="bg-white p-4 rounded-lg border border-red-100">
                    <p className="text-gray-600 text-sm mb-1">Lỗi:</p>
                    <p className="font-semibold text-red-700">
                      {error ? getErrorMessage(error) : getErrorMessage(responseCode)}
                    </p>
                    {responseCode && (
                      <p className="text-xs text-gray-500 mt-2">Mã lỗi VNPay: {responseCode}</p>
                    )}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-900 text-sm font-semibold mb-2">
                    Một số nguyên nhân thường gặp:
                  </p>
                  <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                    <li>Số dư tài khoản không đủ</li>
                    <li>Thông tin thẻ không chính xác</li>
                    <li>Hủy giao dịch từ phía người dùng</li>
                    <li>Hết thời gian thanh toán (15 phút)</li>
                    <li>Ngân hàng đang bảo trì</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Tự động chuyển về trang hóa đơn sau <span className="font-bold text-red-600 text-lg">{countdown}</span> giây...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/patient/payments")}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 transition font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <ArrowLeft size={20} />
                Quay lại hóa đơn
              </button>
              <button
                onClick={() => navigate("/patient/dashboard")}
                className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ⚠️ LỖI KHÔNG XÁC ĐỊNH
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-8 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Có lỗi xảy ra</h1>
          <p className="text-amber-100">Không thể xác định trạng thái thanh toán</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-900 mb-4">
              {error === "server_error" 
                ? "Lỗi hệ thống từ phía máy chủ. Vui lòng thử lại sau." 
                : "Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra lại hóa đơn của bạn."}
            </p>
            <p className="text-sm text-amber-700">
              Nếu bạn đã thanh toán thành công nhưng gặp lỗi này, vui lòng liên hệ bộ phận hỗ trợ với mã giao dịch.
            </p>
          </div>

          {/* Countdown */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">
              Tự động chuyển về trang hóa đơn sau <span className="font-bold text-amber-600 text-lg">{countdown}</span> giây...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/patient/payments")}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <FileText size={20} />
              Kiểm tra hóa đơn
            </button>
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}