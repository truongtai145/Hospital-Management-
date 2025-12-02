import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  LogOut,
  Settings
} from 'lucide-react';

const DoctorSideNav = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tổng quan', path: '/doctor', icon: LayoutDashboard },
    {name: 'Hồ sơ cá nhân', path: '/doctor/profile', icon: Settings },
    { name: 'Thông tin bệnh nhân', path: '/doctor/patients', icon: Users },
    { name: 'Lịch hẹn khám', path: '/doctor/appointments', icon: CalendarClock },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 h-full z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-blue-50">
        <h1 className="text-xl font-bold text-primary">DOCTOR <span className="text-secondary">PORTAL</span></h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-secondary text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-secondary'
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Menu */}
      <div className="p-4 border-t border-gray-200">
        <Link to="/doctor/profile" className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium mb-1">
          <Settings size={20} /> Cài đặt tài khoản
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default DoctorSideNav;