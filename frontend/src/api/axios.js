import axios from 'axios';


const api = axios.create({
 
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý lỗi 401 và request chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // Nếu không có refresh token, không thể làm gì hơn
          throw new Error('No refresh token available');
        }

        // Gọi API để làm mới token. Dùng chính instance 'api' đã cấu hình.
        const response = await api.post('/auth/refresh', { refresh_token: refreshToken });

        const { access_token } = response.data;
        
        // Lưu token mới vào localStorage
        localStorage.setItem('access_token', access_token);
        
        // Cập nhật header cho request gốc và thực hiện lại nó
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        
        // Nếu làm mới token thất bại, xóa hết thông tin và chuyển hướng về trang đăng nhập
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        window.location.href = '/login'; 
        return Promise.reject(refreshError);
      }
    }

    // Trả về các lỗi khác (không phải 401)
    return Promise.reject(error);
  }
);

export { api };