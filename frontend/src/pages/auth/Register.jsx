import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

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
        <div className="register-container">
            <form className="register-box" onSubmit={handleSubmit}>
                <h2>Tạo tài khoản</h2>
                {error && <p className="error">{error}</p>}

                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="patient">Bệnh nhân</option>
                    <option value="doctor">Bác sĩ</option>
                </select>

                <input name="full_name" placeholder="Họ và tên" value={form.full_name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />

                <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
                <input name="avatar_url" placeholder="Ảnh đại diện (URL)" value={form.avatar_url} onChange={handleChange} />

                {isDoctor ? (
                    <>
                        <input name="department_id" placeholder="Mã khoa (ID)" value={form.department_id} onChange={handleChange} />
                        <input name="specialization" placeholder="Chuyên khoa" value={form.specialization} onChange={handleChange} />
                        <input name="license_number" placeholder="Số chứng chỉ hành nghề" value={form.license_number} onChange={handleChange} />
                        <input name="education" placeholder="Trình độ" value={form.education} onChange={handleChange} />
                        <input
                            name="experience_years"
                            placeholder="Số năm kinh nghiệm"
                            value={form.experience_years}
                            onChange={handleChange}
                            type="number"
                            min="0"
                        />
                        <textarea name="biography" placeholder="Tiểu sử" value={form.biography} onChange={handleChange} />
                        <input
                            name="consultation_fee"
                            placeholder="Phí khám"
                            value={form.consultation_fee}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            step="0.01"
                        />
                    </>
                ) : (
                    <>
                        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />
                        <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            <option value="">Giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                        <input name="insurance_number" placeholder="Số bảo hiểm" value={form.insurance_number} onChange={handleChange} />
                        <textarea name="allergies" placeholder="Dị ứng" value={form.allergies} onChange={handleChange} />
                        <textarea name="medical_history" placeholder="Tiền sử bệnh" value={form.medical_history} onChange={handleChange} />
                    </>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>

                <p>
                    Đã có tài khoản? <a href="/login">Đăng nhập</a>
                </p>
            </form>
        </div>
    );
}

