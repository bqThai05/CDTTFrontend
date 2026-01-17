// src/services/api.js
import axios from 'axios';

// Backend server URL
export const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : 'https://api-socialpro-753322230318.asia-southeast1.run.app/api/v1'; 
// export const BASE_URL = 'http://localhost:8000/api/v1'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// CONFIG AXIOS INTERCEPTORS
// ============================================================

// Request Interceptor: Tự động gắn Token vào Header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Tự động đá ra Login nếu Token hết hạn (Lỗi 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Tránh reload vòng lặp nếu đang ở trang login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 1. AUTH API (ĐĂNG NHẬP / ĐĂNG KÝ)
// ============================================================

// 🔥 QUAN TRỌNG: Hàm Login chuẩn cho FastAPI (x-www-form-urlencoded)
const login = (username, password) => {
  const formData = new URLSearchParams();
  formData.append('username', username); // FastAPI yêu cầu field này tên là 'username' (dù là email)
  formData.append('password', password);
  
  return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

const registerUser = (userData) => api.post('/auth/register', userData);
const verifyEmail = (verificationData) => api.post('/auth/verify-email', verificationData);
const forgotPassword = (email) => api.post('/password-reset/forgot-password', { email });
const resetPassword = (data) => api.post('/password-reset/reset-password', data);
const changeUserPassword = (data) => api.post('/password-reset/change-password', data);

// ============================================================
// 2. USER API
// ============================================================
const getCurrentUser = () => api.get('/users/me'); 
const updateUserProfile = (data) => api.put('/users/me', data); 

// ============================================================
// 3. WORKSPACE API
// ============================================================
const getWorkspaces = () => api.get('/workspaces');
const getWorkspaceDetails = (workspaceId) => api.get(`/workspaces/${workspaceId}`);
const createWorkspace = (workspaceData) => api.post('/workspaces', workspaceData);
const updateWorkspace = (workspaceId, data) => api.put(`/workspaces/${workspaceId}`, data);
const deleteWorkspace = (workspaceId) => api.delete(`/workspaces/${workspaceId}`);

// Members & Permissions
const getWorkspaceMembers = (workspaceId) => api.get(`/workspaces/${workspaceId}/members`);
const inviteUserToWorkspace = (workspaceId, inviteData) => api.post(`/workspaces/${workspaceId}/invite`, inviteData);
const updateWorkspaceMemberRole = (workspaceId, memberId, roleData) => api.put(`/workspaces/${workspaceId}/members/${memberId}/role`, roleData);
const removeWorkspaceMember = (workspaceId, memberId) => api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
const leaveWorkspace = (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`);
const transferWorkspaceOwnership = (workspaceId, newOwnerId) => api.post(`/workspaces/${workspaceId}/transfer-ownership/${newOwnerId}`);
const getUserWorkspacePermissions = (workspaceId, userId) => api.get(`/workspaces/${workspaceId}/permissions/${userId}`);
const acceptWorkspaceInvitation = (token) => api.post('/workspaces/accept-invite', null, { params: { token } });

// Social Accounts in Workspace
const getWorkspaceSocialAccounts = (workspaceId) => api.get(`/workspaces/${workspaceId}/social-accounts`);
const linkSocialAccountToWorkspace = (workspaceId, socialAccountId) => api.post(`/workspaces/${workspaceId}/social-accounts`, { social_account_id: socialAccountId });
const unlinkSocialAccountFromWorkspace = (workspaceId, socialAccountId) => api.delete(`/workspaces/${workspaceId}/social-accounts/${socialAccountId}`);

// Inbox & Logs
const getWorkspaceLogs = (workspaceId) => api.get(`/workspaces/${workspaceId}/logs`);
const getWorkspaceInboxComments = (workspaceId) => api.get(`/workspaces/${workspaceId}/inbox`);
const assignCommentToUser = (commentId, assignData) => api.put(`/workspaces/inbox/comments/${commentId}/assign`, assignData);
const replyToComment = (commentId, replyData) => api.post(`/workspaces/inbox/comments/${commentId}/reply`, replyData);

// ============================================================
// 4. POSTS & CONTENT API
// ============================================================
const getWorkspacePosts = (workspaceId) => api.get(`/workspaces/${workspaceId}/posts`);
const createWorkspacePost = (workspaceId, postData) => api.post(`/workspaces/${workspaceId}/posts`, postData);
const updateWorkspacePost = (workspaceId, postId, postData) => api.put(`/workspaces/${workspaceId}/posts/${postId}`, postData);
const deleteWorkspacePost = (workspaceId, postId) => api.delete(`/workspaces/${workspaceId}/posts/${postId}`);
const publishWorkspacePostNow = (workspaceId, postId) => api.post(`/workspaces/${workspaceId}/posts/${postId}/publish-now`);
const createPostComment = (workspaceId, postId, commentData) => api.post(`/workspaces/${workspaceId}/posts/${postId}/comments`, commentData);

// 🔥 Lấy thống kê bài viết (Dùng cho Dashboard)
const getWorkspaceAnalytics = (workspaceId) => api.get(`/posts/${workspaceId}/analytics`);

// ============================================================
// 5. SOCIAL ACCOUNT API (Tổng hợp & YouTube)
// ============================================================
// Lấy danh sách tài khoản MXH
const getAllSocialAccounts = () => api.get('/social'); 
// Ngắt kết nối MXH
const disconnectSocialAccount = (id) => api.delete(`/social/${id}`);
// Lấy kênh Youtube (để tính view/sub)
const getYouTubeChannels = (socialAccountId) => api.get(`/youtube/channels/${socialAccountId}`);
// Lấy video của kênh Youtube
const getYouTubeChannelVideos = (channelId) => api.get(`/youtube/channels/${channelId}/videos`);
// Cập nhật video Youtube
const updateYouTubeVideo = (videoId, data) => api.put(`/youtube/videos/${videoId}`, data);
// Xóa video Youtube
const deleteYouTubeVideo = (videoId) => api.delete(`/youtube/videos/${videoId}`);
// Lấy bình luận của video Youtube
const getYouTubeVideoComments = (videoId) => api.get(`/youtube/videos/${videoId}/comments`);
// Trả lời bình luận Youtube
const replyToYouTubeComment = (commentId, text) => api.post(`/youtube/comments/${commentId}/reply`, { text });
// Lấy danh sách playlist của kênh Youtube
const getYouTubeChannelPlaylists = (channelId) => api.get(`/youtube/channels/${channelId}/playlists`);
// Lấy danh sách video trong playlist
const getYouTubePlaylistItems = (playlistId) => api.get(`/youtube/playlists/${playlistId}/items`);
// Tạo danh sách phát mới
const createYouTubePlaylist = (data) => api.post('/youtube/playlists', data);
// Cập nhật danh sách phát
const updateYouTubePlaylist = (playlistId, data) => api.put(`/youtube/playlists/${playlistId}`, data);
// Xóa danh sách phát
const deleteYouTubePlaylist = (playlistId) => api.delete(`/youtube/playlists/${playlistId}`);
// Thêm video vào danh sách phát
const addVideoToYouTubePlaylist = (playlistId, data) => api.post(`/youtube/playlists/${playlistId}/items`, data);
// Xóa video khỏi danh sách phát
const deleteYouTubePlaylistItem = (playlistId, itemId) => api.delete(`/youtube/playlists/${playlistId}/items/${itemId}`);

// ============================================================
// 6. FACEBOOK API
// ============================================================
const getFacebookPages = (socialAccountId) => api.get(`/facebook/pages/${socialAccountId}`);
const getFacebookPagePosts = (pageId) => api.get(`/facebook/pages/${pageId}/posts`);
const getFacebookPageAnalytics = (pageId, params) => api.get(`/facebook/pages/${pageId}/analytics`, { params });


// ============================================================
// EXPORT TẤT CẢ
// ============================================================
export {
  // Auth
  login,
  registerUser,
  verifyEmail,
  forgotPassword, 
  resetPassword,
  changeUserPassword,
  
  // User
  getCurrentUser,
  updateUserProfile,
  
  // Workspace Core
  getWorkspaces,
  getWorkspaceDetails,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  acceptWorkspaceInvitation,
  leaveWorkspace,
  transferWorkspaceOwnership,
  
  // Workspace Members & Permissions
  getWorkspaceMembers,
  inviteUserToWorkspace,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
  getUserWorkspacePermissions,
  getWorkspaceSocialAccounts,
  linkSocialAccountToWorkspace,
  unlinkSocialAccountFromWorkspace,
  
  // Workspace Logs & Inbox
  getWorkspaceLogs,
  getWorkspaceInboxComments,
  assignCommentToUser,
  replyToComment,
  
  // Posts
  getWorkspacePosts,
  createWorkspacePost,
  updateWorkspacePost,
  deleteWorkspacePost,
  publishWorkspacePostNow,
  createPostComment,
  getWorkspaceAnalytics,
  
  // Social General
  getAllSocialAccounts,
  disconnectSocialAccount,
  
  // YouTube
  getYouTubeChannels,
  getYouTubeChannelVideos,
  updateYouTubeVideo,
  deleteYouTubeVideo,
  getYouTubeVideoComments,
  replyToYouTubeComment,
  getYouTubeChannelPlaylists,
  getYouTubePlaylistItems,
  createYouTubePlaylist,
  updateYouTubePlaylist,
  deleteYouTubePlaylist,
  addVideoToYouTubePlaylist,
  deleteYouTubePlaylistItem,
  
  // Facebook
  getFacebookPages,
  getFacebookPagePosts,
  getFacebookPageAnalytics
};

export default api;
