import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            switch (res.data.user.role) {
                case "admin":
                    navigate("/admin");
                    break;
                case "doctor":
                    navigate("/doctor");
                    break;
                case "patient":
                default:
                    navigate("/patient");
            }
        } catch (err) {
            const message = err.response?.data?.message ?? "Sai email hoặc mật khẩu";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-box">
                <h2>Cổng Đăng Nhập</h2>

                {error && <p className="error">{error}</p>}

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                    required
                />

                <label>Mật khẩu</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>

                <p>
                    Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
                </p>
            </form>
        </div>
    );
}
