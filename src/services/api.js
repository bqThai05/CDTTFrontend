// src/services/api.js
import axios from 'axios';

// Backend server
const BASE_URL = 'https://api-socialpro-753322230318.asia-southeast1.run.app/api/v1'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
const registerUser = (userData) => api.post('/auth/register', userData);
const verifyEmail = (verificationData) => api.post('/auth/verify-email', verificationData);
const forgotPassword = (email) => api.post('/password-reset/forgot-password', { email });
const resetPassword = (data) => api.post('/password-reset/reset-password', data);


// --- WORKSPACE API ---
const getWorkspaces = () => api.get('/workspaces/'); // Cái này giữ nguyên vì lấy danh sách thường cần /
const getWorkspaceDetails = (workspaceId) => api.get(`/workspaces/${workspaceId}`);
const createWorkspace = (workspaceData) => api.post('/workspaces/', workspaceData);

// 🛠️ ĐÃ SỬA: XÓA DẤU GẠCH CHÉO Ở CUỐI ĐỂ KHÔNG BỊ LỖI CORS REDIRECT
const updateWorkspace = (workspaceId, data) => api.put(`/workspaces/${workspaceId}`, data);
const deleteWorkspace = (workspaceId) => api.delete(`/workspaces/${workspaceId}`);// ------------------------------------------------------------------

// --- USER & PROFILE API ---
// 1. Lấy thông tin chính mình
const getCurrentUser = () => api.get('/users/me'); 
// (Nếu backend chưa có /users/me, mình sẽ dùng tạm localStorage trong giao diện)

// 2. Cập nhật thông tin (Tên, Avatar...)
const updateUserProfile = (data) => api.put('/users/me', data); 

// 3. Đổi mật khẩu (Endpoint này dựa trên file Python bạn gửi lúc trước)
const changeUserPassword = (data) => api.post('/password-reset/change-password', data);

const getWorkspaceMembers = (workspaceId) => api.get(`/workspaces/${workspaceId}/members`);
const inviteUserToWorkspace = (workspaceId, inviteData) => api.post(`/workspaces/${workspaceId}/invite`, inviteData);
const getWorkspaceLogs = (workspaceId) => api.get(`/workspaces/${workspaceId}/logs`);
const createWorkspacePost = (workspaceId, postData) => api.post(`/workspaces/${workspaceId}/posts`, postData);
const publishWorkspacePostNow = (workspaceId, postId) => api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
const getWorkspacePosts = (workspaceId) => api.get(`/workspaces/${workspaceId}/posts`);
const updateWorkspacePost = (workspaceId, postId, postData) => api.put(`/workspaces/${workspaceId}/posts/${postId}`, postData);
const deleteWorkspacePost = (workspaceId, postId) => api.delete(`/workspaces/${workspaceId}/posts/${postId}`);
const updateWorkspaceMemberRole = (workspaceId, memberId, roleData) => api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, roleData);
const removeWorkspaceMember = (workspaceId, memberId) => api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
const leaveWorkspace = (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`);
const transferWorkspaceOwnership = (workspaceId, newOwnerId) => api.post(`/workspaces/${workspaceId}/transfer-ownership/${newOwnerId}`);
const getUserWorkspacePermissions = (workspaceId, userId) => api.get(`/workspaces/${workspaceId}/permissions/${userId}`);
const getWorkspaceInboxComments = (workspaceId) => api.get(`/workspaces/${workspaceId}/inbox`);
const assignCommentToUser = (commentId, assignData) => api.put(`/workspaces/inbox/comments/${commentId}/assign`, assignData);
const replyToComment = (commentId, replyData) => api.post(`/workspaces/inbox/comments/${commentId}/reply`, replyData);
const createPostComment = (workspaceId, postId, commentData) => api.post(`/workspaces/${workspaceId}/posts/${postId}/comments`, commentData);
const acceptWorkspaceInvitation = (token) => api.post('/workspaces/accept-invite', null, { params: { token } });

export {
  registerUser,
  verifyEmail,
  forgotPassword, 
  resetPassword,
  getWorkspaces,
  getWorkspaceDetails,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  inviteUserToWorkspace,
  getWorkspaceLogs,
  createWorkspacePost,
  publishWorkspacePostNow,
  getWorkspacePosts,
  updateWorkspacePost,
  deleteWorkspacePost,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  leaveWorkspace,
  transferWorkspaceOwnership,
  getUserWorkspacePermissions,
  getWorkspaceInboxComments,
  assignCommentToUser,
  replyToComment,
  createPostComment,
  acceptWorkspaceInvitation,
  getCurrentUser,
  updateUserProfile,
  changeUserPassword,
};

export default api;