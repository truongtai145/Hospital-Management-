import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  Loader, Heart, Droplet, Send, User, Phone, Calendar, 
  Stethoscope, MessageSquare, CheckCircle, FileText, Hash,
  Clock, AlertCircle
} from 'lucide-react';
import Modal from '../modal/Modal';

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

const TimeSlotButton = ({ time, isSelected, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`
      px-4 py-3 rounded-lg font-medium transition-all duration-200
      ${isSelected 
        ? 'bg-white text-primary ring-2 ring-white shadow-lg' 
        : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    <Clock size={16} className="inline mr-2" />
    {time}
  </button>
);

const Appointment = () => {
  const initialFormState = {
    full_name: '', 
    email: '', 
    phone: '', 
    gender: 'male',
    department_id: '', 
    doctor_id: '', 
    appointment_date: '', 
    appointment_time: '', 
    reason: '',
    allergies_at_appointment: '', 
    medical_history_at_appointment: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);

  // Load thông tin user và dữ liệu ban đầu
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setFormData(prev => ({
          ...prev,
          full_name: user.profile?.full_name || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          gender: user.profile?.gender || 'male',
          allergies_at_appointment: user.profile?.allergies || '',
          medical_history_at_appointment: user.profile?.medical_history || '',
        }));
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        console.error('Error parsing user data');
      }
    }

    const fetchData = async () => {
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
      }
    };
    fetchData();
  }, []);

  // Lọc bác sĩ theo khoa
  useEffect(() => {
    if (formData.department_id) {
      setFilteredDoctors(doctors.filter(d => d.department_id.toString() === formData.department_id));
    } else {
      setFilteredDoctors([]);
    }
    setFormData(prev => ({ ...prev, doctor_id: '', appointment_date: '', appointment_time: '' }));
    setAvailableSlots([]);
  }, [formData.department_id, doctors]);

  // Kiểm tra lịch trống khi chọn bác sĩ và ngày
  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      checkAvailability();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, appointment_time: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctor_id, formData.appointment_date]);

  const checkAvailability = async () => {
    setIsCheckingSlots(true);
    setFormData(prev => ({ ...prev, appointment_time: '' }));
    
    try {
      const response = await api.get(
        `/appointments/check-availability?doctor_id=${formData.doctor_id}&date=${formData.appointment_date}`
      );
      
      if (response.data.success) {
        const slots = response.data.data.available_slots || [];
        setAvailableSlots(slots);
        
        if (slots.length === 0) {
          toast.warning('Bác sĩ đã kín lịch trong ngày này. Vui lòng chọn ngày khác.');
        }
      } else {
        setAvailableSlots([]);
        toast.error(response.data.message || 'Không thể kiểm tra lịch trống.');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Lỗi khi kiểm tra lịch trống.');
      setAvailableSlots([]);
    } finally {
      setIsCheckingSlots(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeSlotSelect = (time) => {
    setFormData(prev => ({ ...prev, appointment_time: time }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateForm = () => {
    if (!formData.appointment_time) {
      return { valid: false, message: 'Vui lòng chọn khung giờ khám.' };
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    // Tạo datetime từ date và time
    const appointmentDateTime = `${formData.appointment_date} ${formData.appointment_time}:00`;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        appointment_time: appointmentDateTime
      };
      delete submitData.appointment_date;

      const res = await api.post('/appointments', submitData);
      
      if (res.data.success) {
        const detail = {
          ...formData,
          ...res.data.data,
          doctor_name: doctors.find(d => d.id === parseInt(formData.doctor_id))?.full_name,
          department_name: departments.find(d => d.id === parseInt(formData.department_id))?.name,
          appointment_time: appointmentDateTime
        };
        
        setAppointmentDetails(detail);
        setIsModalOpen(true);
        setFormData(initialFormState);
        setAvailableSlots([]);
        
        toast.success('Đặt lịch hẹn thành công!');
      } else {
        toast.error(res.data.message || 'Đặt lịch thất bại.');
      }
    } catch (err) {
      // ✅ XỬ LÝ LỖI 409 - KHUNG GIỜ BỊ TRÙNG
      if (err.response?.status === 409) {
        toast.error('⚠️ Khung giờ này vừa được đặt bởi người khác! Đang làm mới danh sách...', {
          autoClose: 4000,
          position: 'top-center',
        });
        
        // Reset selected time
        setFormData(prev => ({ ...prev, appointment_time: '' }));
        
        // Tự động refresh lại danh sách slot sau 1.5s
        setTimeout(() => {
          checkAvailability();
          toast.info('✓ Danh sách khung giờ đã được cập nhật. Vui lòng chọn lại.');
        }, 1500);
      } 
      // XỬ LÝ CÁC LỖI KHÁC
      else if (err.response?.status === 401) {
        toast.error('Bạn cần đăng nhập để đặt lịch.');
      } else if (err.response?.status === 404) {
        toast.error('Không tìm thấy hồ sơ bệnh nhân. Vui lòng cập nhật thông tin cá nhân.');
      } else {
        const errorMsg = err.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.';
        toast.error(errorMsg);
      }
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
              <p className="text-gray-600 mb-4">Chỉ vài phút để chủ động chăm sóc sức khỏe của bạn.</p>
              
              <div className="bg-blue-50 border-l-4 border-primary p-4 rounded mt-4">
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <Clock size={18} className="mr-2" />
                  Giờ làm việc
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Ca sáng:</strong> 8:00 - 11:00</li>
                  <li>• <strong>Nghỉ trưa:</strong> 11:00 - 13:00</li>
                  <li>• <strong>Ca chiều:</strong> 13:00 - 20:00</li>
                  <li>• <strong>Thời gian khám:</strong> 30 phút/ca</li>
                </ul>
              </div>

              {/* ✅ THÊM: Cảnh báo về race condition */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <p>Khung giờ có thể bị đặt bởi người khác trong lúc bạn điền form. Hệ thống sẽ tự động cập nhật danh sách nếu điều này xảy ra.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/5 bg-primary p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput 
                    icon={<User />} 
                    label="Họ và tên *" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange} 
                    required 
                  />
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    required 
                    className="appointment-select pt-6"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <FormInput 
                    icon={<User />} 
                    label="Email *" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                  <FormInput 
                    icon={<Phone />} 
                    label="Số điện thoại *" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                {/* Chọn khoa, bác sĩ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select 
                    name="department_id" 
                    value={formData.department_id} 
                    onChange={handleChange} 
                    required 
                    className="appointment-select pt-6"
                  >
                    <option value="">-- Chọn khoa * --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select 
                    name="doctor_id" 
                    value={formData.doctor_id} 
                    onChange={handleChange} 
                    disabled={!formData.department_id} 
                    className="appointment-select pt-6" 
                    required
                  >
                    <option value="">-- Chọn bác sĩ * --</option>
                    {filteredDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Chọn ngày */}
                <FormInput 
                  icon={<Calendar />} 
                  label="Chọn ngày khám *" 
                  name="appointment_date" 
                  type="date" 
                  value={formData.appointment_date} 
                  onChange={handleChange} 
                  min={getMinDate()}
                  disabled={!formData.doctor_id}
                  required 
                />

                {/* Hiển thị khung giờ trống */}
                {formData.appointment_date && formData.doctor_id && (
                  <div className="space-y-3">
                    <label className="text-white font-semibold flex items-center gap-2">
                      <Clock size={18} />
                      Chọn khung giờ khám *
                    </label>
                    
                    {isCheckingSlots ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader className="animate-spin text-white" size={32} />
                        <span className="ml-3 text-white">Đang kiểm tra lịch trống...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-lg">
                          {availableSlots.map((slot) => (
                            <TimeSlotButton
                              key={slot}
                              time={slot}
                              isSelected={formData.appointment_time === slot}
                              onClick={() => handleTimeSlotSelect(slot)}
                            />
                          ))}
                        </div>
                        {/* ✅ Hiển thị số slot còn trống */}
                        <p className="text-white/80 text-sm text-center">
                          Còn <span className="font-bold text-white">{availableSlots.length}</span> khung giờ trống
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-white">
                        <AlertCircle size={24} />
                        <span>Không có khung giờ trống. Vui lòng chọn ngày khác.</span>
                      </div>
                    )}
                  </div>
                )}

                <FormTextarea 
                  icon={<MessageSquare />} 
                  label="Lý do khám *" 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleChange} 
                  rows="3" 
                  maxLength={500} 
                  required 
                />

                <div className="pt-4 border-t border-white/20 space-y-6">
                  <h4 className="text-white font-semibold text-lg">Thông tin y tế bổ sung</h4>
                  <FormTextarea 
                    icon={<Droplet />} 
                    label="Tiền sử dị ứng" 
                    name="allergies_at_appointment" 
                    value={formData.allergies_at_appointment} 
                    onChange={handleChange} 
                    rows="2" 
                    maxLength={500} 
                  />
                  <FormTextarea 
                    icon={<Heart />} 
                    label="Tiền sử bệnh án" 
                    name="medical_history_at_appointment" 
                    value={formData.medical_history_at_appointment} 
                    onChange={handleChange} 
                    rows="2" 
                    maxLength={500} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !formData.appointment_time} 
                  className="w-full bg-slate-100 text-primary font-bold py-4 rounded-lg hover:bg-white transition flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Gửi đi <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal hiển thị chi tiết lịch hẹn */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Đặt lịch thành công!">
        {appointmentDetails && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold text-lg">
              <Hash size={20} /> Mã lịch hẹn: {appointmentDetails.id}
            </div>

            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
              <p className="text-gray-600 mb-2">Lịch hẹn đã được ghi nhận và đang chờ xác nhận từ bác sĩ hoặc admin.</p>
              <p className="text-sm text-gray-500">Bạn sẽ nhận được thông báo khi lịch hẹn được xác nhận.</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                <InfoItem icon={<User />} title="Bệnh nhân" value={appointmentDetails.full_name} />
                <InfoItem icon={<Phone />} title="Số điện thoại" value={appointmentDetails.phone} />
                <InfoItem 
                  icon={<Calendar />} 
                  title="Thời gian" 
                  value={new Date(appointmentDetails.appointment_time).toLocaleString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 
                />
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
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-900 transition"
              >
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