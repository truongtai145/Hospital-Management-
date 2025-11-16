import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Dashboard */}
                <Route path="/admin" element={<h1>Admin Dashboard</h1>} />
                <Route path="/doctor" element={<h1>Doctor Dashboard</h1>} />
                <Route path="/patient" element={<h1>Patient Dashboard</h1>} />
            </Routes>
        </BrowserRouter>
    );
}
