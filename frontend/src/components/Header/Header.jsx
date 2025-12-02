import React from "react";
import { Link } from "react-router-dom"; 
import Button from "../Button/Button";
import { Phone, Clock, MapPin, Search } from "lucide-react";

const Header = () => {
  
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
    <header className="w-full bg-white">
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

     
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto max-w-7xl px-10 py-4 flex justify-between items-center">
          
          <ul className="flex gap-12 font-medium text-lg">
            <NavLink to="/" label="Trang chủ" />
            <NavLink to="/about" label="Giới thiệu" />
            <NavLink to="/services" label="Dịch vụ" />
            <NavLink to="/doctors" label="Bác sĩ" />
            <NavLink to="/news" label="Tin tức" />
            <NavLink to="/contact" label="Liên hệ" />
          </ul>

          <div className="flex items-center gap-6">
            <Search className="w-6 h-6 cursor-pointer hover:text-secondary transition duration-300" />

            {/* Nút đặt lịch cũng nên gắn link */}
            <Link to="/appointment">
              <Button
                variant="light"
                className="px-8 py-3 text-base font-bold shadow-md hover:shadow-xl transition-all"
              >
                Đặt lịch hẹn
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
