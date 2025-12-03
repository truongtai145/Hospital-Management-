import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import { Phone, Clock, MapPin, Search, User, LogOut, ChevronDown, FileText } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Kiểm tra trạng thái đăng nhập khi load trang
  useEffect(() => {
    // Lấy thông tin user từ localStorage (Đã lưu ở bước Login)
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login"); // Chuyển về trang đăng nhập
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
      {/* Top Bar */}
      <div className="hidden md:flex justify-between items-center py-5 container mx-auto max-w-7xl px-10">
        <Link
          to="/"
          className="text-3xl font-bold text-primary uppercase tracking-wider hover:opacity-70 transition"
        >
          Med<span className="text-secondary">dical</span>
        </Link>

        {/* Thông tin liên hệ */}
        <div className="flex gap-10 text-primary">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">
                Khẩn cấp
              </p>
              <p className="text-secondary font-medium text-lg leading-tight">
                (237) 681-812-255
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">
                Giờ làm việc
              </p>
              <p className="text-secondary font-medium text-lg leading-tight">
                09:00 - 20:00
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-secondary" />
            <div>
              <p className="font-bold uppercase text-xs tracking-wide">
                Địa điểm
              </p>
              <p className="text-secondary font-medium text-lg leading-tight">
                0123 Quận 1, TP.HCM
              </p>
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

            {/* --- ĐÃ DI CHUYỂN NÚT ĐẶT LỊCH LÊN ĐÂY --- */}
            <Link to="/appointment">
              <Button
                variant="light"
                className="px-6 py-2.5 text-sm lg:text-base font-bold shadow-md hover:shadow-xl transition-all whitespace-nowrap"
              >
                Đặt lịch hẹn
              </Button>
            </Link>
            
            {/* --- ĐÃ DI CHUYỂN KHU VỰC NGƯỜI DÙNG XUỐNG ĐÂY --- */}
            {user ? (
              // 1. Nếu ĐÃ ĐĂNG NHẬP -> Hiện tên + Dropdown Menu
              <div className="relative group">
                <div className="flex items-center gap-2 cursor-pointer py-2 hover:opacity-90">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold border-2 border-white">
                    {/* Lấy ký tự đầu của tên làm avatar */}
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="font-medium text-sm hidden lg:block max-w-[150px] truncate">
                    Xin chào, {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </div>

                {/* Dropdown Menu (Hiện khi hover vào group) */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white text-primary rounded-lg shadow-xl overflow-hidden hidden group-hover:block transition-all transform origin-top-right border border-gray-100 animate-fadeIn">
                  <Link 
                    to={
                      user.role === 'admin' ? '/admin' : 
                      user.role === 'doctor' ? '/doctor' : 
                      '/patient' // Đường dẫn hồ sơ bệnh nhân
                    } 
                    className="flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors"
                  >
                    <User size={16} /> Hồ sơ của tôi
                  </Link>
                  
                  {/* Nếu là bệnh nhân thì hiện lịch sử khám (Ví dụ) */}
                  {user.role === 'patient' && (
                    <Link to="/patient/history" className="flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors">
                      <FileText size={16} /> Lịch sử khám
                    </Link>
                  )}

                  <div className="border-t border-gray-100"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              // 2. Nếu CHƯA ĐĂNG NHẬP -> Hiện nút Đăng nhập
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