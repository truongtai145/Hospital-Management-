import { Phone, Clock, MapPin, Search } from "lucide-react";
import Button from "../Button/Button";

const Header = () => {
  return (
    <header className="w-full">
      {/* TOP BAR */}
      <div className="hidden md:flex justify-between items-center py-4 container mx-auto px-4">
        <div className="text-3xl font-bold text-blue-900 uppercase tracking-wider">
          Med<span className="text-blue-500">dical</span>
        </div>

        <div className="flex gap-10 text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-bold uppercase">Khẩn cấp</p>
              <p className="text-blue-500">(237) 681-812-255</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-bold uppercase">Giờ làm việc</p>
              <p className="text-blue-500">09:00 - 20:00 Mỗi ngày</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-bold uppercase">Địa điểm</p>
              <p className="text-blue-500">Quận 1, TP.HCM</p>
            </div>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <nav className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <ul className="flex gap-8 font-medium">
            <li className="hover:text-blue-400 cursor-pointer transition">Trang chủ</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Giới thiệu</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Dịch vụ</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Bác sĩ</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Tin tức</li>
            <li className="hover:text-blue-400 cursor-pointer transition">Liên hệ</li>
          </ul>

          <div className="flex items-center gap-5">
            <Search className="w-5 h-5 cursor-pointer hover:text-blue-400" />
            <Button variant="light" className="px-6 py-2 text-sm">
              Đặt lịch hẹn
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
