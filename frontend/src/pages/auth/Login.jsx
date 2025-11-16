import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.post("/login", {
                username,
                password,
            });

            // Lưu token + role
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);

            // Điều hướng theo role
            switch (res.data.user.role) {
                case "admin":
                    navigate("/admin");
                    break;
                case "doctor":
                    navigate("/doctor");
                    break;
                case "patient":
                    navigate("/patient");
                    break;
                default:
                    navigate("/");
            }

        // eslint-disable-next-line no-unused-vars
        } catch (err) {
            setError("Sai tài khoản hoặc mật khẩu!");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-box">
                <h2>Cổng Đăng Nhập</h2>

                {error && <p className="error">{error}</p>}

                <label>Tên đăng nhập</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                />

                <label>Mật khẩu</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                />

                <button type="submit">Đăng nhập</button>

                <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
            </form>
        </div>
    );
}
