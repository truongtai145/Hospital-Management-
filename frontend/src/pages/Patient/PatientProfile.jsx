import React, { useState, useEffect } from 'react';
import { api } from '../../api/axios';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Calendar, Shield, Save, Loader, Briefcase, Droplet, UserCheck } from 'lucide-react';


// eslint-disable-next-line no-unused-vars
const ProfileInput = ({ icon, label, name, value, onChange, type = 'text', required = false, as: Component = 'input', ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {React.cloneElement(icon, { size: 18, className: 'text-gray-400' })}
      </div>
      <Component
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        type={type}
        required={required}
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
        {...props}
      />
    </div>
  </div>
);

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);

    try {
      const response = await api.get('/patient/profile');

      if (response.data.data) {
        let p = response.data.data;

        // --- FIX NGÀY CHUẨN ---
        if (p.date_of_birth) {
          const iso = p.date_of_birth;
          p.date_of_birth = iso.split("T")[0];   // lấy phần YYYY-MM-DD
        }
        // -----------------------

        setProfile(p); // <-- Bây giờ set mới đúng
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/patient/profile', profile);
      
      if (response.data.success) {
        toast.success("Cập nhật hồ sơ thành công!");
        const updatedProfile = response.data.data;
        setProfile(updatedProfile);

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          storedUser.profile = updatedProfile;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
      console.error("Update profile error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader className="animate-spin text-primary" size={48} />
        <p className="ml-4 text-gray-600">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center mt-20 text-gray-500">Không tìm thấy thông tin hồ sơ.</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 md:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : <User />}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-primary text-center sm:text-left">
              Hồ sơ của {profile.full_name}
            </h1>
            <p className="text-gray-500 mt-1 text-center sm:text-left">
              Cập nhật thông tin của bạn để chúng tôi có thể phục vụ tốt hơn.
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Thông tin cá nhân */}
          <div className="p-8 md:p-10 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center gap-3">
              <UserCheck size={24} /> Thông tin cá nhân
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <ProfileInput icon={<User />} label="Họ và tên" name="full_name" value={profile.full_name} onChange={handleChange} required />
              <ProfileInput icon={<Phone />} label="Số điện thoại" name="phone" value={profile.phone} onChange={handleChange} />
              <ProfileInput icon={<Calendar />} label="Ngày sinh" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} type="date" />
              <div>
                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                <select id="gender" name="gender" value={profile.gender || ''} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <ProfileInput icon={<MapPin />} label="Địa chỉ" name="address" value={profile.address} onChange={handleChange} as="textarea" rows={3} />
              </div>
            </div>
          </div>
          
          {/* Thông tin y tế */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center gap-3">
              <Briefcase size={24} /> Thông tin y tế
            </h2>
            <div className="space-y-6">
               <ProfileInput icon={<Shield />} label="Số bảo hiểm y tế" name="insurance_number" value={profile.insurance_number} onChange={handleChange} />
            </div>
          </div>

          {/* Nút Lưu */}
          <div className="bg-slate-50/70 p-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-blue-900 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PatientProfile;