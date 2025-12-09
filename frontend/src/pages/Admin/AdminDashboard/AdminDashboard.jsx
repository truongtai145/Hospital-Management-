import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  Loader,
  AlertCircle
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
import { api } from '../../../api/axios';
import { toast } from 'react-toastify';
import Pagination from "../../../components/Pagination/Pagination";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [period, setPeriod] = useState('today'); // today, week, month
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all dashboard data
      const [statsRes, chartRes, appointmentsRes] = await Promise.all([
        api.get(`/admin/dashboard/stats?period=${period}`),
        api.get(`/admin/dashboard/chart?period=${period === 'today' ? 'week' : 'month'}`),
        api.get('/admin/dashboard/recent-appointments')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (chartRes.data.success) {
        setChartData(chartRes.data.data);
      }

      if (appointmentsRes.data.success) {
        setRecentAppointments(appointmentsRes.data.data);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      const errorMsg = error.response?.data?.message || 'Không thể tải dữ liệu dashboard';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <Loader size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500">Đang tải dữ liệu dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-96 space-y-4">
          <AlertCircle size={64} className="text-red-500" />
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
            >
              Thử lại
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = [
    { 
      label: "Lịch khám hôm nay", 
      value: stats?.appointments?.total || 0, 
      desc: `${stats?.appointments?.pending || 0} đang chờ xử lý`, 
      icon: CalendarCheck, 
      color: "bg-blue-100 text-blue-600",
      trend: stats?.appointments?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.appointments?.trend || 0)
    },
    { 
      label: "Doanh thu ngày", 
      value: stats?.revenue?.total ? `${(stats.revenue.total / 1000000).toFixed(1)}M VND` : "0 VND", 
      desc: `Trung bình ${stats?.revenue?.average ? Math.round(stats.revenue.average / 1000) + 'k' : '0'}/lượt`, 
      icon: DollarSign, 
      color: "bg-green-100 text-green-600",
      trend: stats?.revenue?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.revenue?.trend || 0)
    },
    { 
      label: "Bệnh nhân mới", 
      value: stats?.patients?.new || 0, 
      desc: `${stats?.patients?.trend >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(stats?.patients?.trend || 0)}% so với hôm qua`, 
      icon: Users, 
      color: "bg-purple-100 text-purple-600",
      trend: stats?.patients?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.patients?.trend || 0)
    },
    { 
      label: "Bác sĩ trực", 
      value: `${stats?.doctors?.active || 0}/${stats?.doctors?.total || 0}`, 
      desc: "Đang hoạt động", 
      icon: Activity, 
      color: "bg-orange-100 text-orange-600",
      trend: 'up',
      trendValue: stats?.doctors?.trend || 0
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary">Tổng quan bệnh viện</h1>
            <p className="text-gray-500 text-sm mt-1">
              Báo cáo hoạt động ngày {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button 
              onClick={() => setPeriod('today')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === 'today' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Hôm nay
            </button>
            <button 
              onClick={() => setPeriod('week')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === 'week' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tuần này
            </button>
            <button 
              onClick={() => setPeriod('month')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                period === 'month' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat, idx) => (
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
                    <TrendingUp size={12} className="mr-1" /> +{stat.trendValue}%
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    <TrendingDown size={12} className="mr-1" /> -{stat.trendValue}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Chart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-primary">
                Biểu đồ lượt khám ({period === 'today' ? 'Tuần này' : 'Tháng này'})
              </h2>
            </div>
            <div className="h-72 w-full">
              {chartData.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Không có dữ liệu
                </div>
              )}
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

        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary">Lịch hẹn gần đây</h2>
            <Link to="/admin/appointments" className="text-sm font-medium text-secondary hover:underline">
              Xem tất cả
            </Link>
          </div>
          {recentAppointments.length > 0 ? (
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
                  {recentAppointments.slice(0, 5).map((app, idx)  => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition last:border-0">
                      <td className="py-4 text-sm font-bold text-gray-700">{app.code}</td>
                      <td className="py-4 text-sm font-medium text-primary">{app.patient}</td>
                      <td className="py-4 text-sm text-gray-600">{app.doctor}</td>
                      <td className="py-4 text-sm text-gray-600 max-w-xs truncate">{app.type}</td>
                      <td className="py-4 text-sm text-gray-600">{app.time}</td>
                      <td className="py-4 text-right">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Chưa có lịch hẹn nào
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

// Component phụ
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
    confirmed: "bg-blue-100 text-blue-700",
  };
  const labels = {
    completed: "Hoàn thành",
    processing: "Đang khám",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
    confirmed: "Đã xác nhận",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
};

export default AdminDashboard;