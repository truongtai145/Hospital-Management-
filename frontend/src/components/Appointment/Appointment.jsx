import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { Loader, Heart, Droplet, Send, User, Phone, Calendar, Stethoscope, MessageSquare, CheckCircle } from 'lucide-react';
import Modal from '../../components/Modal/Modal';

// ===================================================================
// COMPONENT CON TÁI SỬ DỤNG
// ===================================================================
const FormInput = ({ icon, label, name, value, onChange, type = 'text', ...props }) => (
    <div className="relative">
        <input
            id={name} name={name} value={value} onChange={onChange} type={type}
            className="appointment-input peer" placeholder=" " {...props}
        />
        <label htmlFor={name} className="appointment-label">
            {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })} {label}
        </label>
    </div>
);
const FormTextarea = ({ icon, label, name, value, onChange, ...props }) => (
    <div className="relative">
        <textarea
            id={name} name={name} value={value} onChange={onChange}
            className="appointment-input peer" placeholder=" " {...props}
        />
        <label htmlFor={name} className="appointment-label top-4">
            {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })} {label}
        </label>
    </div>
);
const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 w-8 text-primary/70">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-primary">{value}</p>
      </div>
    </div>
);

// ===================================================================
// COMPONENT CHÍNH
// ===================================================================
const Appointment = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', gender: 'male',
    department_id: '', doctor_id: '', appointment_time: '', reason: '',
    allergies_at_appointment: '', medical_history_at_appointment: '',
  });

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setFormData(prev => ({
        ...prev,
        full_name: storedUser.profile?.full_name || '', email: storedUser.email || '',
        phone: storedUser.profile?.phone || '', gender: storedUser.profile?.gender || 'male',
        allergies_at_appointment: storedUser.profile?.allergies || '', medical_history_at_appointment: storedUser.profile?.medical_history || '',
      }));
    }

    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors')
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Lỗi: Không thể tải danh sách khoa hoặc bác sĩ.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      const filtered = doctors.filter(doc => doc.department_id.toString() === formData.department_id);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
    setFormData(prev => ({ ...prev, doctor_id: '' }));
  }, [formData.department_id, doctors]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAppointmentTime = () => {
    if (!formData.appointment_time) return { valid: false, message: "Vui lòng chọn ngày giờ khám." };
    const selectedDate = new Date(formData.appointment_time);
    const dayOfWeek = selectedDate.getDay();
    const hour = selectedDate.getHours();

    if (dayOfWeek === 0) return { valid: false, message: "Phòng khám không làm việc vào Chủ Nhật." };
    if (hour < 8 || hour >= 20) return { valid: false, message: "Vui lòng chọn giờ khám từ 08:00 đến 20:00." };
    return { valid: true };
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 7);
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timeValidation = validateAppointmentTime();
    if (!timeValidation.valid) {
      toast.error(timeValidation.message);
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/appointments', formData);
      if (response.data.success) {
        setAppointmentDetails(response.data.data);
        setIsModalOpen(true);
        setFormData({ /* reset form */ });
      } else {
        toast.error(response.data.message || "Đặt lịch thất bại.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đặt lịch thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setAppointmentDetails(null);
  };

  return (
    <>
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
              <p className="font-bold text-lg uppercase tracking-widest text-secondary mb-4">Đặt lịch khám</p>
              <h2 className="text-4xl lg:text-5xl font-serif text-primary font-medium mb-6">Đặt lịch hẹn</h2>
              <p className="text-gray-600 leading-relaxed">
                Quan tâm bản thân bắt đầu bằng một cuộc hẹn dành riêng cho bạn. Chỉ cần vài phút để đặt lịch, bạn đã chủ động dành thời gian chăm sóc sức khỏe và tinh thần của mình.
              </p>
            </div>
            
            <div className="lg:w-3/5 bg-primary p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <FormInput icon={<User />} label="Họ và tên *" name="full_name" value={formData.full_name} onChange={handleChange} required />
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="appointment-select pt-6">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <FormInput icon={<User />} label="Email *" name="email" value={formData.email} onChange={handleChange} type="email" required />
                  <FormInput icon={<Phone />} label="Số điện thoại *" name="phone" value={formData.phone} onChange={handleChange} type="tel" required />
                  <select name="department_id" value={formData.department_id} onChange={handleChange} required className="appointment-select pt-6">
                    <option value="">-- Chọn Khoa * --</option>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                  <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required className="appointment-select pt-6" disabled={isDataLoading || !formData.department_id}>
                    <option value="">-- Chọn Bác sĩ * --</option>
                    {filteredDoctors.map(doc => <option key={doc.id} value={doc.id}>{doc.full_name}</option>)}
                  </select>
                </div>
                
                <FormInput icon={<Calendar />} label="Chọn ngày giờ khám *" name="appointment_time" value={formData.appointment_time} onChange={handleChange} type="datetime-local" required min={getMinDateTime()} />
                <FormTextarea icon={<MessageSquare />} label="Lý do khám bệnh *" name="reason" value={formData.reason} onChange={handleChange} rows="3" required />
                
                <div className="pt-4 border-t border-white/20 space-y-6">
                  <h4 className="text-white font-semibold text-lg">Thông tin y tế bổ sung (nếu có)</h4>
                  <FormTextarea icon={<Droplet />} label="Tiền sử dị ứng" name="allergies_at_appointment" value={formData.allergies_at_appointment} onChange={handleChange} placeholder="Ví dụ: Dị ứng thuốc kháng sinh, hải sản..." rows="2" />
                  <FormTextarea icon={<Heart />} label="Tiền sử bệnh án" name="medical_history_at_appointment" value={formData.medical_history_at_appointment} onChange={handleChange} placeholder="Ví dụ: Bệnh tim mạch, tiểu đường..." rows="2" />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-slate-100 text-primary font-bold py-4 px-6 rounded-lg hover:bg-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                  {isLoading ? <Loader className="animate-spin" /> : <>Gửi đi <Send size={20} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={closeAndResetModal} title="Đặt lịch thành công!">
        {appointmentDetails && (
          <div>
            <div className="text-center mb-6">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={48} strokeWidth={1.5} />
              <p className="text-gray-600">Lịch hẹn của bạn đã được ghi nhận và đang chờ xác nhận. Chúng tôi sẽ thông báo cho bạn sớm nhất.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-lg text-primary mb-2">Thông tin lịch hẹn</h4>
              <InfoRow icon={<User />} label="Bệnh nhân" value={appointmentDetails.full_name} />
              <InfoRow icon={<Phone />} label="Số điện thoại" value={appointmentDetails.phone} />
              <InfoRow icon={<Calendar />} label="Thời gian" value={new Date(appointmentDetails.appointment_time).toLocaleString('vi-VN')} />
              <InfoRow icon={<Stethoscope />} label="Bác sĩ" value={doctors.find(d => d.id === parseInt(appointmentDetails.doctor_id))?.full_name || 'Chưa xác định'} />
              <div className="pt-3 text-center"><p className="text-xs text-gray-400">Mã lịch hẹn: #{appointmentDetails.id}</p></div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={closeAndResetModal} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition">OK</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Appointment;