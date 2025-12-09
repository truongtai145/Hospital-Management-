import React, { useState, useEffect } from 'react';
import SideNav from './SideNav';
import { Menu, Bell, Search, User, X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin admin từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAdminInfo(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <SideNav handleLogout={handleLogout} />
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SideNav handleLogout={handleLogout} />
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-xs text-gray-500 hidden md:block">Chào mừng trở lại, Admin!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search - Desktop only */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64 transition"
              />
            </div>

            {/* Notifications */}
            <div className="relative cursor-pointer group">
              <div className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell size={22} className="text-gray-600 group-hover:text-blue-600 transition" />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg">
                  3
                </span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                {adminInfo?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-gray-700">
                  {adminInfo?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">
                  {adminInfo?.role === 'admin' ? 'Quản trị viên' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-gray-600">
              © 2025 Hospital Management System. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Version 1.0.0 | Powered by MedCare
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;