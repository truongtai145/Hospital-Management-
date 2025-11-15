import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignInUser } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Nhập email và mật khẩu");

    try {
      setLoading(true);
      const res = await SignInUser(email, password);

      toast.success("Đăng nhập thành công");

      // Lưu token vào localStorage
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("user_role", res.user.role);

      // Redirect theo role
      const role = res.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else navigate("/patient/dashboard");

    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F4C81] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0F4C81]/40 backdrop-blur-md rounded-2xl border border-cyan-400/30 p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-2 text-center">
          Hospital Portal
        </h1>
        <p className="text-cyan-200/70 text-center mb-6">
          Welcome back, please login
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label className="block text-cyan-100/70 text-[10px] uppercase mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 mb-4 rounded-md bg-transparent border border-cyan-400/30 text-cyan-50 placeholder:text-cyan-200/40 focus:ring-1 focus:ring-cyan-400 transition"
            required
          />

          {/* Password */}
          <label className="block text-cyan-100/70 text-[10px] uppercase mb-1">
            Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full px-3 py-2 pr-10 rounded-md bg-transparent border border-cyan-400/30 text-cyan-50 placeholder:text-cyan-200/40 focus:ring-1 focus:ring-cyan-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-300 hover:text-cyan-100 transition"
              aria-label="Hiện mật khẩu"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-400/20 px-5 py-2.5 font-medium text-cyan-50 shadow-md hover:bg-cyan-400/30 disabled:opacity-60 transition-colors"
          >
            {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
