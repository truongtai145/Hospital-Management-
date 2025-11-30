import React from 'react';
import Button from '../Button/Button';
import { Phone, Clock, MapPin, Search } from 'lucide-react'; // Cần cài: npm install lucide-react

const Header = () => {
  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="hidden md:flex justify-between items-center py-4 container mx-auto px-4">
        <div className="text-3xl font-bold text-primary uppercase tracking-wider">
          Med<span className="text-secondary">dical</span>
        </div>
        <div className="flex gap-8 text-sm text-primary">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-bold uppercase">Khẩn cấp</p>
              <p className="text-secondary">(237) 681-812-255</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-bold uppercase">Giờ làm việc</p>
              <p className="text-secondary">09:00 - 20:00 Mỗi ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-bold uppercase">Địa điểm</p>
              <p className="text-secondary">0123 Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <ul className="flex gap-8 font-medium">
            <li className="hover:text-secondary cursor-pointer transition">Trang chủ</li>
            <li className="hover:text-secondary cursor-pointer transition">Giới thiệu</li>
            <li className="hover:text-secondary cursor-pointer transition">Dịch vụ</li>
            <li className="hover:text-secondary cursor-pointer transition">Bác sĩ</li>
            <li className="hover:text-secondary cursor-pointer transition">Tin tức</li>
            <li className="hover:text-secondary cursor-pointer transition">Liên hệ</li>
          </ul>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 cursor-pointer hover:text-secondary" />
            <Button variant="light" className="px-6 py-2 text-sm">Đặt lịch hẹn</Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;