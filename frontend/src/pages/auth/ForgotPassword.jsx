import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { Mail, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Gửi email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("Mã xác thực đã được gửi đến email của bạn!");
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nhập OTP
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Chỉ cho phép số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus ô tiếp theo
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = otp.join("");

    if (token.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-reset-token", { email, token });
      toast.success("Xác thực thành công!");
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || "Mã xác thực không đúng";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        token: otp.join(""),
        password,
        password_confirmation: passwordConfirm,
      });
      
      toast.success("Đặt lại mật khẩu thành công!");
      
      // XÓA TẤT CẢ DỮ LIỆU CŨ TRONG LOCALSTORAGE
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
      
      // Chuyển hướng đến trang đăng nhập sau 2 giây
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-blue-100">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl uppercase tracking-wider mb-4 hover:opacity-80 transition-opacity">
            <span>Med<span className="text-secondary">dical</span></span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4 mb-2">
            <Shield className="w-8 h-8 text-secondary" />
            <h2 className="text-3xl font-serif text-primary">Quên Mật Khẩu</h2>
          </div>
          <p className="text-gray-500 text-sm">
            {step === 1 && "Nhập email để nhận mã xác thực"}
            {step === 2 && "Nhập mã 6 số đã gửi đến email của bạn"}
            {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 w-16 rounded-full transition-all ${step >= s ? "bg-secondary" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition duration-200 bg-gray-50 focus:bg-white"
                  placeholder="user@benhvien.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-700 text-white font-bold rounded-lg hover:from-blue-900 hover:to-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
            >
              {loading ? "Đang gửi..." : "Gửi mã xác thực"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Mã xác thực đã được gửi đến <strong>{email}</strong>
              </p>
              
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition-all"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSendEmail({ preventDefault: () => {} })}
                className="text-sm text-secondary hover:underline block mx-auto"
              >
                Gửi lại mã
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-700 text-white font-bold rounded-lg hover:from-blue-900 hover:to-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </button>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-600 font-medium">Xác thực thành công!</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Mật khẩu mới</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition duration-200"
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition duration-200"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-700 text-white font-bold rounded-lg hover:from-blue-900 hover:to-primary transition-all duration-300 transform hover:scale-105 disabled:opacity-70"
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
}