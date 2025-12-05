import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, GraduationCap, Award, Clock, DollarSign, Save, Loader, AlertCircle, Camera } from 'lucide-react';
import { api } from "../../../api/axios";
import { toast } from 'react-toastify';

const DoctorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    specialization: '',
    education: '',
    experience_years: '',
    biography: '',
    avatar_url: '',
    is_available: true,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/doctor/profile');
      if (response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          specialization: profileData.specialization || '',
          education: profileData.education || '',
          experience_years: profileData.experience_years || '',
          biography: profileData.biography || '',
          avatar_url: profileData.avatar_url || '',
          is_available: profileData.is_available ?? true,
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể tải thông tin hồ sơ";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await api.put('/doctor/profile', formData);
      if (response.data.success) {
        setProfile(response.data.data);
        toast.success('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Không thể cập nhật hồ sơ";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <Loader size={48} className="animate-spin text-blue-600" />
        <p className="text-gray-500">Đang tải hồ sơ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <AlertCircle size={64} className="text-red-500" />
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Hồ sơ cá nhân</h2>
            <p className="text-gray-500">Quản lý thông tin cá nhân và trình độ chuyên môn</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              formData.is_available 
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}>
              {formData.is_available ? 'Đang hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Thông tin cơ bản
          </h3>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold mb-3 relative group">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{formData.full_name?.charAt(0)?.toUpperCase() || 'D'}</span>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Nhấn để thay đổi ảnh</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Tài khoản)
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-600">{profile?.user?.email || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoa
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <Briefcase size={18} className="text-gray-400" />
                  <span className="text-gray-600">{profile?.department?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Ảnh đại diện
                </label>
                <input
                  type="url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-blue-600" />
            Thông tin chuyên môn
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <Briefcase size={16} />
                Chuyên khoa
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Tim mạch, Nội khoa..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <Clock size={16} />
                Số năm kinh nghiệm
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <GraduationCap size={16} />
                Trình độ học vấn
              </label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VD: Bác sĩ Đa khoa - Đại học Y Hà Nội (2010)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiểu sử & Giới thiệu
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Giới thiệu về bản thân, kinh nghiệm làm việc, thành tích..."
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-blue-600" />
            Thông tin khác
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phí khám (VNĐ)
              </label>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <DollarSign size={18} className="text-gray-400" />
                <span className="text-gray-600">
                  {profile?.consultation_fee 
                    ? new Intl.NumberFormat('vi-VN').format(profile.consultation_fee)
                    : 'Chưa cập nhật'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">* Chỉ admin mới có thể thay đổi</p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Đang hoạt động (Sẵn sàng nhận lịch hẹn)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Tắt trạng thái này nếu bạn tạm thời không tiếp nhận bệnh nhân mới
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={18} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfile;