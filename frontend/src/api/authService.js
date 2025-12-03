import { api } from './axios';
import { toast } from 'react-toastify';

/**
 * JWT Auth Service
 */
const authService = {
  /**
   * Đăng ký tài khoản mới
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      toast.success("Đăng ký thành công!");
      return response.data;

    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
      throw error;
    }
  },

  /**
   * Đăng nhập với JWT
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role);

        toast.success("Đăng nhập thành công!");
      }

      return response.data;

    } catch (error) {
      toast.error(error.response?.data?.message || "Sai email hoặc mật khẩu!");
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      await api.post('/auth/logout', { refresh_token: refreshToken });

      authService.clearStorage();
      toast.success("Đăng xuất thành công!");
      return true;

    } catch (error) {
      authService.clearStorage();
      toast.error("Có lỗi khi đăng xuất!");
      throw error;
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role);
      }

      return response.data;

    } catch (error) {
      toast.error("Không thể lấy thông tin người dùng!");
      throw error;
    }
  },

  /**
   * Refresh JWT access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        toast.warning("Bạn cần đăng nhập lại!");
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refresh_token: refreshToken });

      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access_token);
        toast.success("Token đã được làm mới!");
      }

      return response.data;

    } catch (error) {
      authService.clearStorage();
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      throw error;
    }
  },

  /**
   * Clear localStorage
   */
  clearStorage: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated: () => {
    const accessToken = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(accessToken && user);
  },

  /**
   * Lấy role của user hiện tại
   */
  getUserRole: () => {
    return localStorage.getItem('role');
  },

  /**
   * Lấy thông tin user từ localStorage
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Lấy access token
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  /**
   * Lấy refresh token
   */
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Decode JWT token
   */
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);

    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },

  /**
   * Kiểm tra token đã hết hạn chưa
   */
  isTokenExpired: (token) => {
    try {
      const decoded = authService.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const now = Date.now() / 1000;
      return decoded.exp < now;

    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return true;
    }
  }
};

export default authService;
