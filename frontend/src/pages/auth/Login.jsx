import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axios";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Activity } from "lucide-react";
import { toast } from "react-toastify";
export default function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      const { access_token, refresh_token, user } = res.data;
       toast.success("Đăng nhập thành công!");
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem("access_token", access_token);
        if (refresh_token) {
          localStorage.setItem("refresh_token", refresh_token);
        }
        localStorage.setItem("role", user.role);
        localStorage.setItem("user", JSON.stringify(user));
      }

      // Điều hướng dựa trên quyền hạn
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "doctor":
          navigate("/doctor-dashboard");
          break;
        case "patient":
        default:
          navigate("/");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.";
      setError(message);
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

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 border border-blue-100 backdrop-blur-sm">
        {/* Header Form */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl uppercase tracking-wider mb-4 hover:opacity-80 transition-opacity">
            <span>Med<span className="text-secondary">dical</span></span>
          </Link>
          <h2 className="text-3xl font-serif text-primary mt-2 mb-2">Đăng Nhập</h2>
          <p className="text-gray-500 text-sm">Chào mừng quay trở lại hệ thống quản lý bệnh viện</p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 text-sm rounded-lg shadow-sm animate-shake">
            <p className="font-bold">Lỗi đăng nhập</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
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
                placeholder="bacsi@benhvien.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs text-secondary hover:underline font-medium transition-all hover:text-blue-700">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary focus:ring-opacity-20 transition duration-200 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white uppercase tracking-wider bg-gradient-to-r from-primary to-blue-700 hover:from-blue-900 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Activity className="animate-spin h-5 w-5" /> 
                <span>Đang xử lý...</span>
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc</span>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-bold text-secondary hover:text-blue-700 transition-colors underline-offset-2 hover:underline">
              Đăng ký lịch khám ngay
            </Link>
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" /> 
            <span>Quay về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}