// Redesigned Appointment Form Component
import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  Loader, Heart, Droplet, Send, User, Phone, Calendar, 
  Stethoscope, MessageSquare, CheckCircle, FileText, Hash 
} from 'lucide-react';
import Modal from '../modal/Modal';

// Input Component
const FormInput = ({ icon, label, name, value, onChange, type = 'text', ...props }) => (
  <div className="relative w-full">
    <input 
      id={name} 
      name={name} 
      value={value} 
      onChange={onChange} 
      type={type} 
      className="appointment-input peer" 
      placeholder=" " 
      {...props} 
    />
    <label htmlFor={name} className="appointment-label">
      {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })} {label}
    </label>
  </div>
);

// Textarea Component
const FormTextarea = ({ icon, label, name, value, onChange, ...props }) => (
  <div className="relative w-full">
    <textarea 
      id={name} 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="appointment-input peer" 
      placeholder=" " 
      {...props} 
    />
    <label htmlFor={name} className="appointment-label top-4">
      {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })} {label}
    </label>
  </div>
);

// Info Item Component
const InfoItem = ({ icon, title, value }) => (
  <div className="flex gap-3 py-3 border-b border-gray-100 last:border-none">
    <div className="text-primary/80">{icon}</div>
    <div className="flex-1">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold text-primary whitespace-pre-wrap break-words max-h-20 overflow-y-auto pr-1">
        {value || 'Không có'}
      </p>
    </div>
  </div>
);

const Appointment = () => {
  const initialFormState = {
    full_name: '', email: '', phone: '', gender: 'male',
    department_id: '', doctor_id: '', appointment_time: '', reason: '',
    allergies_at_appointment: '', medical_history_at_appointment: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setFormData(prev => ({
        ...prev,
        full_name: storedUser.profile?.full_name || '',
        email: storedUser.email || '',
        phone: storedUser.profile?.phone || '',
        gender: storedUser.profile?.gender || 'male',
        allergies_at_appointment: storedUser.profile?.allergies || '',
        medical_history_at_appointment: storedUser.profile?.medical_history || '',
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
        toast.error('Không thể tải danh sách khoa hoặc bác sĩ.');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.department_id) {
      setFilteredDoctors(doctors.filter(d => d.department_id.toString() === formData.department_id));
    } else {
      setFilteredDoctors([]);
    }
    setFormData(prev => ({ ...prev, doctor_id: '' }));
  }, [formData.department_id, doctors]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateAppointmentTime = () => {
    if (!formData.appointment_time)
      return { valid: false, message: 'Vui lòng chọn ngày giờ khám.' };

    const selected = new Date(formData.appointment_time);

    if (selected < new Date())
      return { valid: false, message: 'Không thể chọn thời gian trong quá khứ.' };
    if (selected.getDay() === 0)
      return { valid: false, message: 'Phòng khám không làm việc vào Chủ Nhật.' };
    if (selected.getHours() < 8 || selected.getHours() >= 20)
      return { valid: false, message: 'Giờ khám hợp lệ: 08:00 - 20:00.' };

    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validateAppointmentTime();
    if (!check.valid) return toast.error(check.message);

    setIsLoading(true);
    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        const detail = {
          ...formData,
          ...res.data.data,
          doctor_name: doctors.find(d => d.id === parseInt(formData.doctor_id))?.full_name,
          department_name: departments.find(d => d.id === parseInt(formData.department_id))?.name,
        };
        setAppointmentDetails(detail);
        setIsModalOpen(true);
        setFormData(initialFormState);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Đặt lịch thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FORM */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="lg:w-2/5 p-10 flex flex-col justify-center">
              <p className="font-bold text-lg uppercase tracking-widest text-secondary mb-4">Đặt lịch khám</p>
              <h2 className="text-4xl font-serif text-primary mb-6">Đặt lịch hẹn</h2>
              <p className="text-gray-600">Chỉ vài phút để chủ động chăm sóc sức khỏe của bạn.</p>
            </div>

            <div className="lg:w-3/5 bg-primary p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput icon={<User />} label="Họ và tên *" name="full_name" value={formData.full_name} onChange={handleChange} required />
                  <select name="gender" value={formData.gender} onChange={handleChange} required className="appointment-select pt-6">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <FormInput icon={<User />} label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  <FormInput icon={<Phone />} label="Số điện thoại *" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                  <select name="department_id" value={formData.department_id} onChange={handleChange} required className="appointment-select pt-6">
                    <option value="">-- Chọn khoa * --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} disabled={!formData.department_id} className="appointment-select pt-6" required>
                    <option value="">-- Chọn bác sĩ * --</option>
                    {filteredDoctors.map(doc => <option key={doc.id} value={doc.id}>{doc.full_name}</option>)}
                  </select>
                </div>

                <FormInput icon={<Calendar />} label="Ngày giờ khám *" name="appointment_time" type="datetime-local" value={formData.appointment_time} onChange={handleChange} required />

                <FormTextarea icon={<MessageSquare />} label="Lý do khám *" name="reason" value={formData.reason} onChange={handleChange} rows="3" maxLength={100} required />

                <div className="pt-4 border-t border-white/20 space-y-6">
                  <h4 className="text-white font-semibold text-lg">Thông tin y tế bổ sung</h4>
                  <FormTextarea icon={<Droplet />} label="Tiền sử dị ứng" name="allergies_at_appointment" value={formData.allergies_at_appointment} onChange={handleChange} rows="2" maxLength={50} />
                  <FormTextarea icon={<Heart />} label="Tiền sử bệnh án" name="medical_history_at_appointment" value={formData.medical_history_at_appointment} onChange={handleChange} rows="2" maxLength={50} />
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-slate-100 text-primary font-bold py-4 rounded-lg hover:bg-white transition flex items-center justify-center gap-3 text-lg">
                  {isLoading ? <Loader className="animate-spin" /> : <>Gửi đi <Send size={20} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Đặt lịch thành công!">
        {appointmentDetails && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
              <Hash size={20} /> Mã lịch hẹn: {appointmentDetails.id}
            </div>

            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <p className="text-gray-600">Lịch hẹn đã được ghi nhận và đang chờ xác nhận.</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                <InfoItem icon={<User />} title="Bệnh nhân" value={appointmentDetails.full_name} />
                <InfoItem icon={<Phone />} title="Số điện thoại" value={appointmentDetails.phone} />
                <InfoItem icon={<Calendar />} title="Thời gian" value={new Date(appointmentDetails.appointment_time).toLocaleString('vi-VN')} />
                <InfoItem icon={<Heart />} title="Bệnh án" value={appointmentDetails.medical_history_at_appointment} />
              </div>
              <div className="space-y-3">
                <InfoItem icon={<Stethoscope />} title="Bác sĩ" value={appointmentDetails.doctor_name} />
                <InfoItem icon={<FileText />} title="Khoa" value={appointmentDetails.department_name} />
                <InfoItem icon={<MessageSquare />} title="Lý do khám" value={appointmentDetails.reason} />
                <InfoItem icon={<Droplet />} title="Dị ứng" value={appointmentDetails.allergies_at_appointment} />
              </div>
            </div>

            <div className="text-right">
              <button onClick={() => setIsModalOpen(false)} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition">
                OK
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Appointment;
