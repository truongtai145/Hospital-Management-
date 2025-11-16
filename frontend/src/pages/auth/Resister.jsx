import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm: "",
        phone: "",
        gender: "",
        address: "",
        role: "patient"
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirm) {
            setError("Mật khẩu không khớp!");
            return;
        }

        try {
            await api.post("/register", form);
            navigate("/login");
        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Đăng ký thất bại!");
        }
    };

    return (
        <div className="register-container">
            <form className="register-box" onSubmit={handleRegister}>
                <h2>Đăng ký tài khoản</h2>

                {error && <p className="error">{error}</p>}

                <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="phone" placeholder="Số điện thoại" onChange={handleChange} />

                <select name="gender" onChange={handleChange}>
                    <option value="">Giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                </select>

                <input name="address" placeholder="Địa chỉ" onChange={handleChange} />

                <select name="role" onChange={handleChange}>
                    <option value="patient">Bệnh nhân</option>
                    <option value="doctor">Bác sĩ</option>
                </select>

                <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} />
                <input type="password" name="confirm" placeholder="Xác nhận mật khẩu" onChange={handleChange} />

                <button type="submit">Đăng ký</button>

                <p>Đã có tài khoản? <a href="/login">Đăng nhập</a></p>
            </form>
        </div>
    );
}
