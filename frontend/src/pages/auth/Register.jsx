import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api/axios";
import { 
  Mail, Lock, Eye, EyeOff, ArrowLeft, Activity, 
  User, Phone, MapPin, Calendar, CreditCard, 
  FileText, Briefcase, GraduationCap, DollarSign 
} from "lucide-react";

const baseForm = {
    role: "patient",
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    insurance_number: "",
    allergies: "",
    medical_history: "",
    avatar_url: "",
    department_id: "",
    specialization: "",
    license_number: "",
    education: "",
    experience_years: "",
    biography: "",
    consultation_fee: "",
};

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState(baseForm);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const buildPayload = () => {
        const payload = {
            role: form.role,
            full_name: form.full_name,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            avatar_url: form.avatar_url || undefined,
        };

        if (form.role === "doctor") {
            return {
                ...payload,
                department_id: form.department_id ? Number(form.department_id) : undefined,
                specialization: form.specialization || undefined,
                license_number: form.license_number || undefined,
                education: form.education || undefined,
                experience_years: form.experience_years ? Number(form.experience_years) : undefined,
                biography: form.biography || undefined,
                consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : undefined,
            };
        }

        return {
            ...payload,
            address: form.address || undefined,
            date_of_birth: form.date_of_birth || undefined,
            gender: form.gender || undefined,
            insurance_number: form.insurance_number || undefined,
            allergies: form.allergies || undefined,
            medical_history: form.medical_history || undefined,
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (form.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setLoading(true);
        try {
            await api.post("/register", buildPayload());
            navigate("/login");
        } catch (err) {
            const message = err.response?.data?.message ?? "Đăng ký thất bại, vui lòng thử lại";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const isDoctor = form.role === "doctor";

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-4xl z-10 border border-blue-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl uppercase tracking-wider mb-2 hover:opacity-80 transition">
                        <span>Med<span className="text-secondary">dical</span></span>
                    </Link>
                    <h2 className="text-3xl font-serif text-primary mt-2">Tạo tài khoản</h2>
                    <p className="text-gray-500 text-sm mt-2">Đăng ký để sử dụng hệ thống quản lý bệnh viện</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 text-sm rounded">
                        <p className="font-bold">Lỗi đăng ký</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Vai trò</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({ ...baseForm, role: "patient" })}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                    form.role === "patient"
                                        ? "border-secondary bg-blue-50 text-secondary font-bold"
                                        : "border-gray-300 hover:border-gray-400"
                                }`}
                            >
                                <User className="h-6 w-6 mx-auto mb-2" />
                                <span className="block text-sm">Bệnh nhân</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...baseForm, role: "doctor" })}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                    form.role === "doctor"
                                        ? "border-secondary bg-blue-50 text-secondary font-bold"
                                        : "border-gray-300 hover:border-gray-400"
                                }`}
                            >
                                <Briefcase className="h-6 w-6 mx-auto mb-2" />
                                <span className="block text-sm">Bác sĩ</span>
                            </button>
                        </div>
                    </div>

                    {/* Common Fields - 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Họ và tên *</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                </div>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Email *</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Mật khẩu *</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Xác nhận mật khẩu *</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 block">Số điện thoại</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    placeholder="0901234567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Role-Specific Fields */}
                    {isDoctor ? (
                        <div className="space-y-6 border-t pt-6">
                            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                Thông tin bác sĩ
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Specialization */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Chuyên khoa</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={form.specialization}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Nội khoa, Ngoại khoa..."
                                    />
                                </div>

                                {/* License Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Số chứng chỉ hành nghề</label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={form.license_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="VD: CCHN123456"
                                    />
                                </div>

                                {/* Education */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Trình độ</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <GraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                        </div>
                                        <input
                                            type="text"
                                            name="education"
                                            value={form.education}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="Tiến sĩ, Thạc sĩ..."
                                        />
                                    </div>
                                </div>

                                {/* Experience Years */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Số năm kinh nghiệm</label>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={form.experience_years}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="5"
                                    />
                                </div>

                                {/* Department ID */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Mã khoa (ID)</label>
                                    <input
                                        type="number"
                                        name="department_id"
                                        value={form.department_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="1"
                                    />
                                </div>

                                {/* Consultation Fee */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Phí khám (VNĐ)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                        </div>
                                        <input
                                            type="number"
                                            name="consultation_fee"
                                            value={form.consultation_fee}
                                            onChange={handleChange}
                                            min="0"
                                            step="1000"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="300000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Biography */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Tiểu sử</label>
                                <textarea
                                    name="biography"
                                    value={form.biography}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Giới thiệu ngắn về bác sĩ..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 border-t pt-6">
                            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Thông tin bệnh nhân
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Ngày sinh</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                        </div>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={form.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Giới tính</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 block">Địa chỉ</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                                        />
                                    </div>
                                </div>

                                {/* Insurance Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">Số bảo hiểm</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-gray-400 group-focus-within:text-secondary transition" />
                                        </div>
                                        <input
                                            type="text"
                                            name="insurance_number"
                                            value={form.insurance_number}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white"
                                            placeholder="VD: BHYT123456789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Dị ứng</label>
                                <textarea
                                    name="allergies"
                                    value={form.allergies}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Các loại thuốc hoặc thực phẩm gây dị ứng..."
                                />
                            </div>

                            {/* Medical History */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Tiền sử bệnh</label>
                                <textarea
                                    name="medical_history"
                                    value={form.medical_history}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition duration-200 bg-gray-50 focus:bg-white resize-none"
                                    placeholder="Các bệnh đã từng mắc phải..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white uppercase tracking-wider bg-primary hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 ${
                            loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Activity className="animate-spin h-5 w-5" /> Đang đăng ký...
                            </div>
                        ) : (
                            "Đăng ký"
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="font-bold text-secondary hover:text-blue-700 transition">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition">
                        <ArrowLeft className="w-3 h-3" /> Quay về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}