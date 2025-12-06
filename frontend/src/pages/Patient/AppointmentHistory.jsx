 
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Loader, Trash2, Filter, Info, ChevronLeft, ChevronRight } from 'lucide-react'; 
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

// Helper để định dạng và lấy màu trạng thái
const statusMap = {
  pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  confirmed: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border border-blue-200' },
  completed: { text: 'Đã khám', color: 'bg-green-100 text-green-800 border border-green-200' },
  cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800 border border-red-200' },
  no_show: { text: 'Không đến', color: 'bg-gray-100 text-gray-800 border border-gray-200' },
};

const ITEMS_PER_PAGE = 3; // Số lượng mục hiển thị mỗi trang

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Lấy danh sách lịch hẹn từ API
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patient/appointments');
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      toast.error("Không thể tải lịch sử hẹn.");
      console.error("Fetch appointments error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Xử lý hủy lịch hẹn
  const handleCancel = async (appointmentId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
      try {
        const response = await api.delete(`/patient/appointments/${appointmentId}`);
        if (response.data.success) {
          toast.success("Hủy lịch hẹn thành công!");
          fetchAppointments(); // Tải lại danh sách sau khi hủy
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Hủy lịch thất bại.");
      }
    }
  };

  // Lọc danh sách theo trạng thái và ngày được chọn
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => {
        const statusMatch = filterStatus === 'all' || app.status === filterStatus;
        const dateMatch = new Date(app.appointment_time).toDateString() === selectedDate.toDateString();
        return statusMatch && dateMatch;
      })
      .sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));
  }, [appointments, filterStatus, selectedDate]);
  
  // Phân trang dữ liệu đã lọc
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, currentPage]);
  
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  // Reset về trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, selectedDate]);
  
  // Lấy các ngày có lịch hẹn để đánh dấu trên calendar
  const appointmentDates = useMemo(() => {
      return new Set(appointments.map(app => new Date(app.appointment_time).toDateString()));
  }, [appointments]);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader size={48} className="animate-spin text-primary"/>
        </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        
        <div className="mb-8">
            <h1 className="text-4xl font-serif text-primary flex items-center gap-3">
              <CalendarIcon /> Lịch Hẹn Của Tôi
            </h1>
            <p className="text-gray-500 mt-2">Xem và quản lý các lịch hẹn khám bệnh của bạn.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="lg:w-1/3 lg:sticky lg:top-24 self-start">
            <div className="bg-white p-4 rounded-2xl shadow-lg">
               <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  locale="vi-VN" // Hiển thị tiếng Việt
                  tileContent={({ date, view }) => 
                    view === 'month' && appointmentDates.has(date.toDateString()) ? (<div className="dot" title="Có lịch hẹn"></div>) : null
                  }
                  className="react-calendar"
               />
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <h2 className="text-2xl font-semibold text-primary">
                    Lịch hẹn ngày {selectedDate.toLocaleDateString('vi-VN')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500"/>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.keys(statusMap).map(status => (
                            <option key={status} value={status}>{statusMap[status].text}</option>
                        ))}
                    </select>
                  </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 table-fixed">
                  <thead className="text-xs text-gray-700 uppercase bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-48">Bác sĩ / Khoa</th>
                      <th scope="col" className="px-6 py-4 w-24">Giờ khám</th>
                      <th scope="col" className="px-6 py-4 w-auto">Triệu chứng</th>
                      <th scope="col" className="px-6 py-4 w-40 text-center">Trạng thái</th>
                      <th scope="col" className="px-6 py-4 w-32 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAppointments.length > 0 ? paginatedAppointments.map((app) => {
                      const appointmentTime = new Date(app.appointment_time);
                      const now = new Date();
                      const canCancel = ['pending', 'confirmed'].includes(app.status) && (appointmentTime.getTime() - now.getTime()) / (1000 * 3600) >= 24;

                      return (
                        <tr key={app.id} className="bg-white border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-primary">
                            <div>{app.doctor.full_name}</div>
                            <div className="font-normal text-gray-500 text-xs mt-1">{app.doctor.department.name}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-lg">{appointmentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="px-6 py-4 break-words">{app.reason}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${statusMap[app.status]?.color || ''}`}>
                                {statusMap[app.status]?.text || app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canCancel ? (
                              <button onClick={() => handleCancel(app.id)} className="font-medium text-white bg-red-500 hover:bg-red-600 rounded-md px-4 py-2 text-xs flex items-center gap-1">
                                <Trash2 size={14}/> Hủy
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Không thể hủy</span>
                            )}
                          </td>
                        </tr>
                      )
                    }) : (
                      <tr>
                        <td colSpan="5" className="text-center p-16 text-gray-500">
                            <Info className="mx-auto mb-4 text-gray-300" size={56} strokeWidth={1} />
                            <p className="font-semibold text-lg">Không có lịch hẹn nào</p>
                            <p className="text-sm mt-1">Không tìm thấy lịch hẹn nào cho ngày và trạng thái bạn đã chọn.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-slate-50">
                    <span className="text-sm text-gray-600">
                        Hiển thị {paginatedAppointments.length} trên {filteredAppointments.length} kết quả
                    </span>
                    <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronRight size={16} />
                    </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppointmentHistory;