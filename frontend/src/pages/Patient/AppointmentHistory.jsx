/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Loader, Trash2, Filter } from 'lucide-react'; 
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

// Helper để định dạng và lấy màu trạng thái
const statusMap = {
  pending: { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  completed: { text: 'Đã khám', color: 'bg-green-100 text-green-800' },
  cancelled: { text: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  no_show: { text: 'Không đến', color: 'bg-gray-100 text-gray-800' },
};

 
const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [calendarDate, setCalendarDate] = useState(new Date());

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

  // Lọc và sắp xếp danh sách hiển thị
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => filterStatus === 'all' || app.status === filterStatus)
      .sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time));
  }, [appointments, filterStatus]);
  
  // Lấy các ngày có lịch hẹn để đánh dấu trên calendar
  const appointmentDates = useMemo(() => {
      return appointments.map(app => new Date(app.appointment_time).toDateString());
  }, [appointments]);


  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin" size={48} /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Phần Lịch */}
        <div className="lg:w-1/3">
           <h2 className="text-2xl font-serif text-primary mb-4">Lịch hẹn của bạn</h2>
           <div className="bg-white p-4 rounded-lg shadow-md">
             <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                tileContent={({ date, view }) =>
                    view === 'month' && appointmentDates.includes(date.toDateString()) ? (
                      <div className="h-2 w-2 bg-green-500 rounded-full mx-auto mt-1" title="Có lịch hẹn"></div>
                    ) : null
                }
             />
           </div>
        </div>

        {/* Phần Bảng */}
        <div className="lg:w-2/3">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-serif text-primary flex items-center gap-2">
              <Calendar /> Lịch Hẹn Của Tôi
            </h1>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Filter size={16} className="text-gray-500"/>
                <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="p-2 border rounded-md"
                >
                    <option value="all">Tất cả trạng thái</option>
                    {Object.keys(statusMap).map(status => (
                        <option key={status} value={status}>{statusMap[status].text}</option>
                    ))}
                </select>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">#</th>
                  <th scope="col" className="px-6 py-3">Bác sĩ</th>
                  <th scope="col" className="px-6 py-3">Khoa</th>
                  <th scope="col" className="px-6 py-3">Ngày khám</th>
                  <th scope="col" className="px-6 py-3">Giờ khám</th>
                  <th scope="col" className="px-6 py-3">Triệu chứng</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                  <th scope="col" className="px-6 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? filteredAppointments.map((app, index) => {
                  const appointmentTime = new Date(app.appointment_time);
                  const now = new Date();
                  const canCancel = ['pending', 'confirmed'].includes(app.status) && (appointmentTime.getTime() - now.getTime()) / (1000 * 3600) >= 24;

                  return (
                    <tr key={app.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{app.doctor.full_name}</td>
                      <td className="px-6 py-4">{app.doctor.department.name}</td>
                      <td className="px-6 py-4">{appointmentTime.toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">{appointmentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4">{app.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusMap[app.status]?.color || ''}`}>
                            {statusMap[app.status]?.text || app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {canCancel ? (
                          <button onClick={() => handleCancel(app.id)} className="font-medium text-white bg-red-600 hover:bg-red-700 rounded-md px-3 py-1">Hủy</button>
                        ) : (
                          <span className="text-gray-400 italic">Không thể hủy</span>
                        )}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan="8" className="text-center p-8">Không có lịch hẹn nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppointmentHistory;