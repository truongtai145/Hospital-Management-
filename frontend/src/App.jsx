// src/routes/App.jsx
import { BrowserRouter as Router } from "react-router-dom";
import ScrollToTop from "./ScrollToTop"; // Đảm bảo file này nằm cùng thư mục routes
import AppRoutes from "./AppRoutes";     // Đảm bảo file này nằm cùng thư mục routes
import { ToastContainer } from 'react-toastify';

// QUAN TRỌNG: Phải import dòng CSS này thì thông báo mới đẹp được
import 'react-toastify/dist/ReactToastify.css'; 

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;