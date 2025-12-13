import { jwtDecode } from 'jwt-decode';

export const getUserIdFromToken = () => {
  const token = localStorage.getItem('access_token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.user_id; // 'user_id' chứa ID người dùng dạng số
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
      return null;
    }
  }
  return null;
};
