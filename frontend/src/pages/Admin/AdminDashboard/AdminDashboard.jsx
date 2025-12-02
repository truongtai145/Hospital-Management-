// src/pages/Admin/AdminDashboard/AdminDashboard.jsx
import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Activity, 
  TrendingUp,
  ClipboardList,
  Stethoscope,
  MessageSquare,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout'; 

const AdminDashboard = () => {
  // --- 1. Dữ liệu giả lập (Mock Data) ---
  const stats = [
    { 
      label: "Lịch khám hôm nay", 
      value: "42", 
      desc: "12 đang chờ xử lý", 
      icon: CalendarCheck, 
      color: "bg-blue-100 text-blue-600",
      trend: "up"
    },
    { 
      label: "Doanh thu ngày", 
      value: "15.2M ₫", 
      desc: "Trung bình 350k/lượt", 
      icon: DollarSign, 
      color: "bg-green-100 text-green-600",
      trend: "up"
    },
    { 
      label: "Bệnh nhân mới", 
      value: "18", 
      desc: "Tăng 12% so với hôm qua", 
      icon: Users, 
      color: "bg-purple-100 text-purple-600",
      trend: "down"
    },
    { 
      label: "Bác sĩ trực", 
      value: "8/12", 
      desc: "Đang hoạt động", 
      icon: Activity, 
      color: "bg-orange-100 text-orange-600",
      trend: "up"
    },
  ];

  // Dữ liệu biểu đồ (Mock)
  const chartData = [
    { label: 'T2', value: 30, revenue: 1500000 },
    { label: 'T3', value: 45, revenue: 2200000 },
    { label: 'T4', value: 38, revenue: 1900000 },
    { label: 'T5', value: 50, revenue: 2500000 },
    { label: 'T6', value: 60, revenue: 3000000 },
    { label: 'T7', value: 25, revenue: 1200000 },
    { label: 'CN', value: 20, revenue: 1000000 },
  ];

  const recentAppointments = [
    { id: 'AP001', patient: 'Nguyễn Văn A', doctor: 'Bs. Trần Thị B', type: 'Khám tổng quát', time: '08:30', status: 'completed' },
    { id: 'AP002', patient: 'Lê Thị C', doctor: 'Bs. Lê Văn D', type: 'Tim mạch', time: '09:00', status: 'processing' },
    { id: 'AP003', patient: 'Phạm Văn E', doctor: 'Bs. Nguyễn Văn F', type: 'Nhi khoa', time: '09:30', status: 'pending' },
    { id: 'AP004', patient: 'Hoàng Thị G', doctor: 'Bs. Trần Thị B', type: 'Khám tổng quát', time: '10:00', status: 'cancelled' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* --- Header Dashboard --- */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">Tổng quan bệnh viện</h1>
            <p className="text-gray-500 text-sm mt-1">Báo cáo hoạt động ngày {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-white shadow-sm">Hôm nay</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100">Tuần này</button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100">Tháng này</button>
          </div>
        </div>

        {/* --- 1. KPI Cards --- */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-gray-800">{stat.value}</h3>
                {stat.trend === 'up' ? (
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <TrendingUp size={12} className="mr-1" /> +12%
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    <TrendingDown size={12} className="mr-1" /> -5%
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* --- 2. Chart & Quick Actions --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-primary">Biểu đồ lượt khám (Tuần này)</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f2b6c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1f2b6c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1f2b6c" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4">Truy cập nhanh</h2>
            <div className="space-y-3">
              <QuickLink to="/admin/appointments" icon={ClipboardList} title="Quản lý Lịch hẹn" desc="Duyệt đơn, xếp lịch" />
              <QuickLink to="/admin/doctors" icon={Stethoscope} title="Quản lý Bác sĩ" desc="Thêm mới, lịch trực" />
              <QuickLink to="/admin/patients" icon={Users} title="Hồ sơ Bệnh nhân" desc="Tra cứu bệnh án" />
              <QuickLink to="/admin/chat" icon={MessageSquare} title="Tư vấn trực tuyến" desc="Trả lời tin nhắn" />
            </div>
          </div>
        </div>

        {/* --- 3. Recent Appointments --- */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary">Lịch hẹn gần đây</h2>
            <Link to="/admin/appointments" className="text-sm font-medium text-secondary hover:underline">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                  <th className="py-3 font-medium">Mã đơn</th>
                  <th className="py-3 font-medium">Bệnh nhân</th>
                  <th className="py-3 font-medium">Bác sĩ</th>
                  <th className="py-3 font-medium">Dịch vụ</th>
                  <th className="py-3 font-medium">Giờ khám</th>
                  <th className="py-3 font-medium text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((app, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition last:border-0">
                    <td className="py-4 text-sm font-bold text-gray-700">{app.id}</td>
                    <td className="py-4 text-sm font-medium text-primary">{app.patient}</td>
                    <td className="py-4 text-sm text-gray-600">{app.doctor}</td>
                    <td className="py-4 text-sm text-gray-600">{app.type}</td>
                    <td className="py-4 text-sm text-gray-600">{app.time}</td>
                    <td className="py-4 text-right">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

// --- Component phụ ---
// eslint-disable-next-line no-unused-vars
const QuickLink = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100 group">
    <div className="bg-blue-50 text-secondary p-3 rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-sm text-gray-700">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-gray-500" />
  </Link>
);

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-orange-100 text-orange-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels = {
    completed: "Hoàn thành",
    processing: "Đang khám",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default AdminDashboard;