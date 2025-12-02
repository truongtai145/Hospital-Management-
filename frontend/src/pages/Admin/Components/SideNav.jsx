import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  MessageSquare, 
  Star, 
  Settings, 
  LogOut 
} from 'lucide-react';

const SideNav = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { name: 'Đơn khám', path: '/admin/appointments', icon: ClipboardList },
    { name: 'Bác sĩ', path: '/admin/doctors', icon: Stethoscope }, 
    { name: 'Bệnh nhân', path: '/admin/patients', icon: Users },  
    { name: 'Chat', path: '/admin/chat', icon: MessageSquare },
    { name: 'Đánh giá', path: '/admin/reviews', icon: Star },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 h-full z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary">MED<span className="text-secondary">DICAL</span></h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
              <Settings size={20} /> Cài đặt
            </Link>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
              <LogOut size={20} /> Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SideNav;