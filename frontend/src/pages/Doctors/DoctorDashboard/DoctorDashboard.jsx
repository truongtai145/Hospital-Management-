import React from 'react';
import DoctorLayout from '../Components/DoctorLayout';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  ChevronRight,
  Stethoscope,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom'; 
const DoctorPage = () => {
  
  // --- Dữ liệu giả lập (Không tính toán) ---
  const todayAppointments = [
    { id: 'BN01', name: 'Lê Thị Thu', time: '08:30', reason: 'Đau tức ngực trái', type: 'Tái khám', status: 'pending' },
    { id: 'BN02', name: 'Trần Văn Nam', time: '09:15', reason: 'Khó thở khi vận động', type: 'Khám mới', status: 'waiting' },
    { id: 'BN03', name: 'Nguyễn Thị Hoa', time: '10:00', reason: 'Kiểm tra huyết áp', type: 'Định kỳ', status: 'finished' },
    { id: 'BN04', name: 'Phạm Minh Tuấn', time: '14:00', reason: 'Đau đầu chóng mặt', type: 'Khám mới', status: 'pending' },
  ];

  const upcomingPatients = [
    { id: 1, name: "Hoàng Gia Bảo", age: 45, date: "Ngày mai, 08:00", gender: "Nam" },
    { id: 2, name: "Võ Thị Sáu", age: 32, date: "Ngày mai, 09:30", gender: "Nữ" },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-8">
        
        {/* --- 1. Header Chào mừng --- */}
        <div className="bg-gradient-to-r from-primary to-blue-800 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-2">Xin chào, Bác sĩ Nguyễn Văn A</h2>
            <p className="text-blue-200">Chúc bác sĩ một ngày làm việc hiệu quả. Hôm nay có <strong className="text-white">4</strong> bệnh nhân đang đợi.</p>
          </div>
          {/* Icon trang trí mờ */}
          <Stethoscope size={150} className="absolute right-[-20px] bottom-[-40px] text-white opacity-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- 2. CỘT TRÁI (LỚN): LỊCH HẸN HÔM NAY --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-secondary" size={24}/> Lịch khám hôm nay
              </h3>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                02/12/2023
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-semibold text-sm border-b border-gray-100">
                  <tr>
                    <th className="p-4">Giờ</th>
                    <th className="p-4">Bệnh nhân</th>
                    <th className="p-4">Triệu chứng/Lý do</th>
                    <th className="p-4">Loại khám</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todayAppointments.map((app, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition">
                      <td className="p-4 font-bold text-primary flex items-center gap-2">
                        <Clock size={16} className="text-gray-400"/> {app.time}
                      </td>
                      <td className="p-4 font-medium text-gray-800">
                        {app.name}
                        <div className="text-xs text-gray-400 font-normal">Mã: {app.id}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{app.reason}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded border ${app.type === 'Tái khám' ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-purple-200 bg-purple-50 text-purple-600'}`}>
                          {app.type}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <StatusPill status={app.status} />
                      </td>
                      <td className="p-4">
                        <button className="bg-secondary text-white text-xs px-3 py-2 rounded hover:bg-blue-600 transition flex items-center gap-1 shadow-sm">
                          Khám <ChevronRight size={14}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- 3. CỘT PHẢI (NHỎ): THÔNG TIN PHỤ --- */}
          <div className="space-y-6">
            
            {/* Card: Hồ sơ chờ duyệt (Ví dụ) */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <FileText size={24}/>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg">Hồ sơ bệnh án</h4>
                        <p className="text-xs text-gray-500">Cần cập nhật sau khám</p>
                    </div>
                </div>
                <div className="text-3xl font-extrabold text-primary mb-1">12</div>
                <p className="text-sm text-gray-500">Hồ sơ chưa hoàn tất trong tuần này.</p>
                <button className="w-full mt-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    Xem danh sách
                </button>
            </div>

            {/* Card: Bệnh nhân sắp tới */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                    Sắp tới
                    <Link to="" className="text-xs text-secondary hover:underline font-normal">Xem tất cả</Link>
                </h4>
                <div className="space-y-4">
                    {upcomingPatients.map(p => (
                        <div key={p.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                {p.gender === 'Nam' ? 'M' : 'F'}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-700">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.age} tuổi • {p.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
      </div>
    </DoctorLayout>
  );
};

// Component phụ hiển thị trạng thái
const StatusPill = ({ status }) => {
    const styles = {
        pending: "bg-gray-100 text-gray-600",
        waiting: "bg-orange-100 text-orange-600 animate-pulse", // Đang chờ khám
        finished: "bg-green-100 text-green-600",
    };
    const labels = {
        pending: "Chưa đến",
        waiting: "Đang đợi",
        finished: "Đã khám",
    };
    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

export default DoctorPage;