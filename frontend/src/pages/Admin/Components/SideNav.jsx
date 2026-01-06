import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  MessageSquare, 
  Building2,
  LogOut 
} from 'lucide-react';
import { prefetchModule } from '../../../routes/lazyLoadModule';

const SideNav = ({ handleLogout }) => {
  const menuItems = [
    { 
      name: 'Tổng quan', 
      path: '/admin', 
      icon: LayoutDashboard,
      // Prefetch function - load trước khi click
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },
    { 
      name: 'Đơn khám', 
      path: '/admin/appointments', 
      icon: ClipboardList,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },
    {
      name: 'Khoa', 
      path: '/admin/departments', 
      icon: Building2,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },
    { 
      name: 'Bác sĩ', 
      path: '/admin/doctors', 
      icon: Stethoscope,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    }, 
    { 
      name: 'Bệnh nhân', 
      path: '/admin/patients', 
      icon: Users,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },  
    { 
      name: 'Quản lý thanh toán', 
      path: '/admin/payments', 
      icon: ClipboardList,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },  
    { 
      name: 'Chat', 
      path: '/admin/chat', 
      icon: MessageSquare,
      onPrefetch: () => prefetchModule(() => import('../../Admin'))
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-0 h-full z-20">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-gray-200">
        <Link to="#" className="text-2xl font-bold text-primary uppercase tracking-wider">
          Med<span className="text-secondary">dical</span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                onMouseEnter={item.onPrefetch} // ⭐ PREFETCH KHI HOVER
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors text-base ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-600 hover:bg-slate-100 hover:text-primary'
                  }`
                }
              >
                <item.icon size={22} strokeWidth={2.5}/>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LogOut size={20} /> Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default SideNav;