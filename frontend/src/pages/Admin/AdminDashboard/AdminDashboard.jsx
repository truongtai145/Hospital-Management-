import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Activity, 
  TrendingUp,
  TrendingDown,
  Loader,
  AlertCircle,
  ChevronRight
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

// Format currency VND
const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [period, setPeriod] = useState('today');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsRes, chartRes, appointmentsRes] = await Promise.all([
        api.get(`/admin/dashboard/stats?period=${period}`),
        api.get(`/admin/dashboard/chart?period=${period}`),
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

  // Xây dựng statsCards với dữ liệu từ backend
  // Backend đã loại bỏ lịch hẹn cancelled và tính doanh thu theo payment_date
  const statsCards = [
    { 
      label: period === 'today' ? "Lịch khám hôm nay" : period === 'week' ? "Lịch khám tuần này" : "Lịch khám tháng này",
      value: stats?.appointments?.total || 0, 
      desc: `${stats?.appointments?.pending || 0} đang chờ xử lý`, 
      icon: CalendarCheck, 
      color: "bg-blue-100 text-blue-600",
      trend: stats?.appointments?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.appointments?.trend || 0)
    },
    { 
      label: period === 'today' ? "Doanh thu hôm nay" : period === 'week' ? "Doanh thu tuần" : "Doanh thu tháng",
      value: formatCurrency(stats?.revenue?.total || 0), 
      desc: `Trung bình ${formatCurrency(stats?.revenue?.average || 0)}/lượt`, 
      icon: DollarSign, 
      color: "bg-green-100 text-green-600",
      trend: stats?.revenue?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.revenue?.trend || 0)
    },
    { 
      label: period === 'today' ? "Bệnh nhân mới hôm nay" : period === 'week' ? "Bệnh nhân mới tuần" : "Bệnh nhân mới tháng",
      value: stats?.patients?.new || 0, 
      desc: stats?.patients?.trend >= 0 
        ? `Tăng ${Math.abs(stats.patients.trend)}% so với kỳ trước`
        : `Giảm ${Math.abs(stats.patients.trend)}% so với kỳ trước`,
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
      trend: stats?.doctors?.trend >= 0 ? 'up' : 'down',
      trendValue: Math.abs(stats?.doctors?.trend || 0)
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tổng quan bệnh viện</h1>
            <p className="text-gray-500 text-sm mt-1">
              Báo cáo hoạt động ngày {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button 
              onClick={() => setPeriod('today')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === 'today' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Hôm nay
            </button>
            <button 
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === 'week' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tuần này
            </button>
            <button 
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === 'month' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                {stat.trendValue !== 0 && (
                  stat.trend === 'up' ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <TrendingUp size={14} className="mr-1" /> +{stat.trendValue}%
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      <TrendingDown size={14} className="mr-1" /> -{stat.trendValue}%
                    </span>
                  )
                )}
              </div>
              <p className="text-xs text-gray-500">{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Biểu đồ lượt khám (không bao gồm lịch đã hủy) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Lượt khám ({period === 'today' ? 'Hôm nay' : period === 'week' ? 'Tuần này' : 'Tháng này'})
              </h2>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: period === 'today' ? 50 : 10 }}>
                    <defs>
                      <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      dy={10}
                      angle={period === 'today' ? -45 : 0}
                      textAnchor={period === 'today' ? 'end' : 'middle'}
                      height={period === 'today' ? 70 : 30}
                      interval={period === 'today' ? 1 : 0}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                        fontSize: '13px',
                        padding: '12px'
                      }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAppointments)" 
                      name="Lượt khám"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Không có dữ liệu</p>
                </div>
              )}
            </div>
          </div>

          {/* Biểu đồ doanh thu (theo thời gian thanh toán thực tế) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800">
                Doanh thu ({period === 'today' ? 'Hôm nay' : period === 'week' ? 'Tuần này' : 'Tháng này'})
              </h2>
            </div>
            <div style={{ width: '100%', height: '300px' }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: period === 'today' ? 50 : 10 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      dy={10}
                      angle={period === 'today' ? -45 : 0}
                      textAnchor={period === 'today' ? 'end' : 'middle'}
                      height={period === 'today' ? 70 : 30}
                      interval={period === 'today' ? 1 : 0}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6b7280', fontSize: 12}} 
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                        return value;
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
                        fontSize: '13px',
                        padding: '12px'
                      }}
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Doanh thu"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">Không có dữ liệu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Appointments (không bao gồm lịch đã hủy) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Lịch hẹn gần đây</h2>
            <Link 
              to="/admin/appointments" 
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Xem tất cả
              <ChevronRight size={16} />
            </Link>
          </div>
          {recentAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold">Mã đơn</th>
                    <th className="py-3 px-4 font-semibold">Bệnh nhân</th>
                    <th className="py-3 px-4 font-semibold">Bác sĩ</th>
                    <th className="py-3 px-4 font-semibold">Dịch vụ</th>
                    <th className="py-3 px-4 font-semibold">Ngày khám</th>
                    <th className="py-3 px-4 font-semibold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.slice(0, 5).map((app, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-bold text-blue-600">{app.code}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-800">{app.patient}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{app.doctor}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">{app.type}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {app.date} {app.time}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <CalendarCheck size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Chưa có lịch hẹn nào</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    processing: "bg-blue-100 text-blue-700 border border-blue-200",
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    cancelled: "bg-red-100 text-red-700 border border-red-200",
    confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
    no_show: "bg-gray-100 text-gray-700 border border-gray-200",
  };
  
  const labels = {
    completed: "Hoàn thành",
    processing: "Đang khám",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
    confirmed: "Đã xác nhận",
    no_show: "Vắng mặt",
  };
  
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  );
};

export default AdminDashboard;