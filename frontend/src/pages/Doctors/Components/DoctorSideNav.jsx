import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  LogOut,
  Settings,
  UserCircle
} from 'lucide-react';

const DoctorSideNav = ({ doctorName, handleLogout }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tổng quan', path: '/doctor-dashboard', icon: LayoutDashboard },
    { name: 'Hồ sơ cá nhân', path: '/doctor-dashboard/profile', icon: UserCircle },
    { name: 'Thông tin bệnh nhân', path: '/doctor-dashboard/patients', icon: Users },
    { name: 'Lịch hẹn khám', path: '/doctor-dashboard/appointments', icon: CalendarClock },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 h-full z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <h1 className="text-xl font-bold text-white">
          DOCTOR <span className="text-blue-200">PORTAL</span>
        </h1>
      </div>

      {/* Doctor Info */}
      <div className="p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {doctorName?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              BS. {doctorName || 'Bác sĩ'}
            </p>
            <p className="text-xs text-gray-500">Bác sĩ điều trị</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : ''} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Menu */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Link 
          to="/doctor-dashboard/profile" 
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium mb-2 transition-all"
        >
          <Settings size={20} /> 
          <span>Cài đặt</span>
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
        >
          <LogOut size={20} /> 
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default DoctorSideNav;