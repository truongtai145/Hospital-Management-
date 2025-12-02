import React from 'react';
import DoctorSideNav from './DoctorSideNav';
import { Bell, User } from 'lucide-react';

const DoctorLayout = ({ children }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      {/* Sidebar */}
      <DoctorSideNav />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            {/* Thông báo */}
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-gray-500 hover:text-secondary transition" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800">Bs. Nguyễn Văn A</p>
                <p className="text-xs text-gray-500">Khoa Tim Mạch</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
                BS
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi */}
        <main className="p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;