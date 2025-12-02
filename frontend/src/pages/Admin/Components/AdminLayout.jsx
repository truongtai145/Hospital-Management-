import React from 'react';
import SideNav from './SideNav';
import { Menu, Bell, Search, User } from 'lucide-react';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <SideNav />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header Admin */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
              <Menu size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Search (Optional) */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm w-64"
              />
            </div>

            {/* Icons */}
            <div className="relative cursor-pointer">
              <Bell size={24} className="text-gray-600 hover:text-primary transition" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-secondary">
                <User size={18} />
              </div>
              <span className="font-medium text-sm text-gray-700">Xin chào, Admin</span>
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi (Children) */}
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;