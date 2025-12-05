import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../Button/Button";
import { Phone, Clock, MapPin, Search, User, LogOut, ChevronDown, FileText } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setUser(null);
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const NavLink = ({ to, label }) => (
    <li>
      <Link
        to={to}
        className="block py-2 hover:text-secondary hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      >
        {label}
      </Link>
    </li>
  );

  return (
    <header className="w-full bg-white font-sans">
      {/* Top Header Info */}
      <div className="hidden md:flex justify-between items-center py-5 container mx-auto max-w-7xl px-10">
        <Link
          to="/"
          className="text-3xl font-bold text-primary uppercase tracking-wider hover:opacity-70 transition"
        >
          Med<span className="text-secondary">dical</span>
        </Link>

        <div className="flex gap-10 text-primary">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">Khẩn cấp</p>
              <p className="text-secondary font-medium text-lg">(237) 681-812-255</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">Giờ làm việc</p>
              <p className="text-secondary font-medium text-lg">08:00 - 20:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">Địa điểm</p>
              <p className="text-secondary font-medium text-lg">0123 Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto max-w-7xl px-10 py-4 flex justify-between items-center">
          <ul className="flex gap-8 lg:gap-12 font-medium text-base lg:text-lg">
            <NavLink to="/" label="Trang chủ" />
            <NavLink to="/about" label="Giới thiệu" />
            <NavLink to="/services" label="Dịch vụ" />
            <NavLink to="/doctors" label="Bác sĩ" />
            <NavLink to="/news" label="Tin tức" />
            <NavLink to="/contact" label="Liên hệ" />
          </ul>

          <div className="flex items-center gap-4 lg:gap-6">
            <Search className="w-6 h-6 cursor-pointer hover:text-secondary transition duration-300" />

            <Link to="/appointment">
              <Button
                variant="light"
                className="px-6 py-2.5 text-sm lg:text-base font-bold shadow-md hover:shadow-xl transition-all whitespace-nowrap"
              >
                Đặt lịch hẹn
              </Button>
            </Link>

            {/* USER LOGIN DROPDOWN */}
            {user ? (
              <div className="relative group">
                {/* Avatar + Greeting */}
                <div className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold border-2 border-white">
                    {user.profile?.full_name
                      ? user.profile.full_name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="font-medium text-sm hidden lg:block whitespace-nowrap">
                    Xin chào, {user.profile?.full_name || user.email}
                  </span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </div>

                {/* Dropdown fixed */}
                <div
                  className="
                    absolute right-0 top-full 
                    w-56 bg-white text-primary rounded-lg shadow-2xl border border-gray-100
                    opacity-0 scale-95 
                    group-hover:opacity-100 group-hover:scale-100 
                    transition-all duration-300 ease-in-out
                    pointer-events-none group-hover:pointer-events-auto
                    z-50
                  "
                >
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm font-semibold truncate">
                      {user.profile?.full_name || "Người dùng"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin"
                        : user.role === "doctor"
                        ? "/doctor"
                        : "/patient"
                    }
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition"
                  >
                    <User size={16} className="text-secondary" /> Hồ sơ của tôi
                  </Link>

                  {user.role === "patient" && (
                    <Link
                      to="/patient/history"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition"
                    >
                      <FileText size={16} className="text-secondary" /> Lịch sử khám
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 border-t border-gray-100 text-left"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-white hover:text-secondary font-medium text-sm lg:text-base flex items-center gap-1 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
